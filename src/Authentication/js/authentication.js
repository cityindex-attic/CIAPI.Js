(function ($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {
            width: 600,
            afterLogOn: function (CIAPIConnection) { },
            afterLogOff: function (CIAPIConnection) { },
            shakeOnError: false,
            translations: {
                "en-GB": { "error": "Error" },
                "pl-PL": { "error": "Błąd" }
            },
            template: $.template('defaultAuthWidgetTemplate',
                '<div class="ui-ciapi-authentication ui-widget ui-widget-content ui-corner-all">                               ' +
                '    <div class="ui-ciapi-logon-view  ui-corner-all" data-bind="visible: activeView() === \'LogOn\'">          ' +
                '    <form class="ui-ciapi-authentication-form">    ' +
                '        <div class="ui-ciapi-authentication-content ui-widget-content ui-corner-top">                         ' +
                '            <p class="ui-state-error" data-bind="text: errorMessage, visible: errorMessage().length > 0"></p> ' +
                '            <fieldset>                                                                                        ' +
                '                <label for="username">${username}</label>                                                     ' +
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   ' +
                '                    <input type="text"                                                                        ' +
                '                       name="username"                                                                        ' +
                '                       id="username"                                                                          ' +
                '                       class="inputFields"                                                                    ' +
                '                       data-bind="value: username"/>                                                          ' +
                '                </div>                                                                                        ' +
                '                <label for="password">${password}</label>                                                     ' +
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   ' +
                '                    <input type="password"                                                                    ' +
                '                       name="password"                                                                        ' +
                '                       id="password"                                                                          ' +
                '                       class="inputFields"                                                                    ' +
                '                       data-bind="value: password"/>                                                          ' +
                '                </div>                                                                                        ' +
                '            </fieldset>                                                                                       ' +
                '        </div>                                                                                                ' +
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix ui-corner-bottom">' +
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOn">${logon}</button>       ' +
                '        </div>       ' +
                    '</form>                                                                                                   ' +
                '    </div>                                                                                                    ' +
                '    <div class="ui-ciapi-logoff-view  ui-corner-all" data-bind="visible: activeView() === \'LogOff\'">        ' +
                '        <div class="ui-ciapi-authentication-content ui-widget-content">                                       ' +
                '            <p>${you_are_logged_in_as} <span data-bind="text: username"/></p>                                 ' +
                '        </div>                                                                                                ' +
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix">                 ' +
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOff">${logoff}</button>     ' +
                '        </div>                                                                                                ' +
                '    </div>                                                                                                    ' +
                '</div>')
        },
        isFormValid: function(viewModel) {
            $.validator.messages.required = "";
            var form = viewModel.widget.element.find('.ui-ciapi-authentication-form');
            form.validate({
                errorClass: "ui-state-error",
                rules: {
                    username: "required",
                    password: "required"
                },
                errorPlacement: function (error, element) {
                    //don't place error messages anywhere
                },
                highlight: function(element, errorClass, validClass) {
                    $(element).parent().addClass(errorClass).removeClass(validClass);
                },
                unhighlight: function(element, errorClass, validClass) {
                    $(element).parent().addClass(validClass).removeClass(errorClass);
                }
            });
            return form.valid();
        },
        _createViewModel: function (widgetRef) {
            return {
                widget: widgetRef,     //Store a reference to this instance of the widget for use in viewModel event handling functions
                username: ko.observable(CIAPI.connection.UserName),
                password: ko.observable(""),
                activeView: ko.observable("LogOn"),
                errorMessage: ko.observable(""),
                doLogOn: function () {
                    var viewModel = this;
                    if (!viewModel.widget.isFormValid(viewModel)) return;
                    CIAPI.connect({
                        UserName: viewModel.username(),
                        Password: viewModel.password(),
                        success: function (data) {
                            viewModel.widget.options.afterLogOn(CIAPI.connection);
                            viewModel.errorMessage("");
                            viewModel.widget._update();
                        },
                        error: function (data) {
                            var errorMsg = $.widget.localize('error') + ': ' + $.widget.localize(data.HttpStatus) + ' [' + data.ErrorCode + ']';
                            //Only add full error message text if culture is English
                            if ($.widget.getCurrentCulture().language == 'en') errorMsg += ' - ' + data.ErrorMessage;
                            viewModel.errorMessage(errorMsg);
                            viewModel.widget._update();
                        }
                    });
                },
                doLogOff: function () {
                    var viewModel = this;
                    CIAPI.disconnect({
                        success: function (data) {
                            viewModel.widget.options.afterLogOff(CIAPI.connection);
                            viewModel.widget._update();
                        }
                    });
                }
            };
        },
        _initCulture: function () {
            //Set sane defaults for translation messages, then initialize the translation messages
            var t = this.options.translations;
            t["en-GB"] = t["en-GB"] || {};
            _(t["en-GB"]).defaults({
                "error": "Error",
                401: "(401) Not authorized",
                500: "(500) Server error",
                "username": "UserName",
                "password": "Password",
                "logon": "Log On",
                "logoff": "Log Off",
                "you_are_logged_in_as":
                "You are logged in as" 
            });

            t["pl-PL"] = t["pl-PL"] || {};
            _(t["pl-PL"]).defaults({
                "error": "Błąd",
                401: "(401) Nie dopuszczony",
                500: "(500) Błąd serwera",
                "username": "Użytkownika",
                "password": "Hasło",
                "logon": "Zaloguj się",
                "logoff": "Wyloguj",
                "you_are_logged_in_as":
                "Jesteś zalogowany jako" 
            });

            t["de-DE"] = t["de-DE"] || {};
            _(t["de-DE"]).defaults({
                "error": "Fehler", 401:
                "(401) Nicht autorisiert",
                500: "(500) Server-Fehler",
                "username": "Benutzername",
                "password": "Kennwort",
                "logon": "Anmeldung",
                "logoff": "Logout",
                "you_are_logged_in_as": "Sie sind angemeldet als" 
            });

            _(this.options.translations).each(function (translations_value, culture_key) {
                $.widget.addCultureInfo(culture_key, { messages: translations_value });
            });

            $.widget.culture(this.options.culture);
        },
        _create: function () {
            this._initCulture();

            //The viewModel needs to be created here rather than defined in options above to prevent cross widget pollution
            this.options.viewModel = this._createViewModel(this);

            $.tmpl(this.options.template, $.widget.getCurrentCulture().messages).appendTo(this.element);

            ko.applyBindings(this.options.viewModel, this.element.get(0));

            this.element.css('width', this.options.width);

            this.element.find(".ui-ciapi-authentication-button").button({
                icons: {
                    primary: "ui-icon-circle-triangle-e"
                }
            });

            this._update();
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        _update: function () {
            var activeView = CIAPI.connection.isConnected ? 'LogOff' : 'LogOn';
            this.options.viewModel.activeView(activeView);

            if (this.options.shakeOnError && this.options.viewModel.errorMessage()) {
                this.element.effect("shake", { times: 2 }, 100);
            }
        }
    });
})(jQuery);