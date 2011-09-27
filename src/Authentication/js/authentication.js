(function ($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {
            ServiceUri: "must_be_set",
            StreamUri: "must_be_set",
            width: 600,
            afterLogOn: function (CIAPIConnection) { },
            afterLogOff: function (CIAPIConnection) { },
            shakeOnError: false,
            translations: {
                "en-GB": { "error": "Error" },
                "pl-PL": { "error": "Błąd" }
            },
            template: $.template('defaultAuthWidgetTemplate',
                '<div class="ui-ciapi-authentication ui-widget ui-widget-content ui-corner-all"> ' +
                '    <div class="ui-ciapi-logon-view  ui-corner-all" data-bind="visible: activeView() === \'LogOn\'">          ' +
                '    <form class="ui-ciapi-authentication-form">    ' +
                '        <div class="ui-ciapi-authentication-content ui-widget-content ui-corner-top">                         ' +
                '            <p class="ui-state-error" data-bind="text: errorMessage, visible: errorMessage().length > 0"></p> ' +
                '            <fieldset>                                                                                        ' +
                '                <label for="username">${username}</label>                                                     ' +
                '                <input type="text"                                                                            ' +
                '                       name="username"                                                                        ' +
                '                       id="username"                                                                          ' +
                '                       class="inputFields ui-widget-content ui-corner-all"                                    ' +
                '                       data-bind="value: username"/>                                                          ' +
                '                <label for="password">${password}</label>                                                     ' +
                '                <input type="password"                                                                        ' +
                '                       name="password"                                                                        ' +
                '                       id="password"                                                                          ' +
                '                       class="inputFields ui-widget-content ui-corner-all"                                    ' +
                '                       data-bind="value: password"/>                                                          ' +
                '            </fieldset>                                                                                       ' +
                '        </div>                                                                                                ' +
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix ui-corner-bottom">' +
                '            <button type="submit" class="ui-ciapi-authentication-button" data-bind="click: doLogOn">${logon}</button>' +
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
        _validateOptions: function () {
            if (this.options.ServiceUri === "must_be_set") alert("You must set the ServiceUri option when calling the AuthenticationWidget");
            if (this.options.StreamUri === "must_be_set") alert("You must set the StreamUri option when calling the AuthenticationWidget");
        },
        isFormValid: function (viewModel) {
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
                highlight: function (element, errorClass, validClass) {
                    $(element).addClass(errorClass).removeClass(validClass);
                },
                unhighlight: function (element, errorClass, validClass) {
                    $(element).addClass(validClass).removeClass(errorClass);
                }
            });
            return form.valid();
        },
        _createViewModel: function (widgetRef) {
            var viewModel = {
                widget: widgetRef,     //Store a reference to this instance of the widget for use in viewModel event handling functions
                username: ko.observable(CIAPI.connection.UserName),
                password: ko.observable(""),
                activeView: ko.observable("LogOn"),
                errorMessage: ko.observable(""),
                doLogOn: function () {
                    var viewModel = this;
                    if (!viewModel.widget.isFormValid(viewModel)) return;
                    viewModel.widget._toggleInput({ isDisabled: true, parentElement: viewModel.widget.element });
                    CIAPI.connect({
                        UserName: viewModel.username(),
                        Password: viewModel.password(),
                        ServiceUri: viewModel.widget.options.ServiceUri,
                        StreamUri: viewModel.widget.options.StreamingUri,
                        success: function (data) {
                            viewModel.widget.options.afterLogOn.call(viewModel.widget, CIAPI.connection);
                            viewModel.password("");
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
                    viewModel.widget._toggleInput({ isDisabled: true, parentElement: viewModel.widget.element });
                    CIAPI.disconnect({
                        success: function (data) {
                            viewModel.widget.options.afterLogOff.call(viewModel.widget, CIAPI.connection);
                            viewModel.widget._update();
                        }
                    });
                }
            };
            return viewModel;
        },
        _initCulture: function () {
            //Set sane defaults for translation messages, then initialize the translation messages
            var t = this.options.translations;
            t["en-GB"] = t["en-GB"] || {};
            _(t["en-GB"]).defaults({
                "error": "Error",
                401: "(401) Not authorized",
                403: "(403) Forbidden",
                500: "(500) Server error",
                "username": "UserName",
                "password": "Password",
                "logon": "Log On",
                "logoff": "Log Off",
                "launch_platform": "Launch platform",
                "you_are_logged_in_as":
                "You are logged in as"
            });

            t["pl-PL"] = t["pl-PL"] || {};
            _(t["pl-PL"]).defaults({
                "error": "Błąd",
                401: "(401) Nie dopuszczony",
                403: "(403) Zakazany",
                500: "(500) Błąd serwera",
                "username": "Użytkownika",
                "password": "Hasło",
                "logon": "Zaloguj się",
                "logoff": "Wyloguj",
                "launch_platform": "Uruchomienie Platformy",
                "you_are_logged_in_as":
                "Jesteś zalogowany jako"
            });

            t["de-DE"] = t["de-DE"] || {};
            _(t["de-DE"]).defaults({
                "error": "Fehler",
                401: "(401) Nicht autorisiert",
                403: "(403) Verboten",
                500: "(500) Server-Fehler",
                "username": "Benutzername",
                "password": "Kennwort",
                "logon": "Anmeldung",
                "logoff": "Logout",
                "launch_platform": "Start-Plattform",
                "you_are_logged_in_as": "Sie sind angemeldet als"
            });

            _(this.options.translations).each(function (translations_value, culture_key) {
                $.widget.addCultureInfo(culture_key, { messages: translations_value });
            });

            $.widget.culture(this.options.culture);
        },
        _toggleInput: function (args) {
            _(args).defaults({
                isDisabled: true,
                parentElement: null
            });
            args.parentElement.find(".ui-ciapi-authentication-button").button("option", "disabled", args.isDisabled);
        },
        _create: function () {
            this._validateOptions();

            this._initCulture();

            CIAPI.reconnect();

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

            //monitor changes to connection status
            var thisWidget = this;
            CIAPI.subscribe("CIAPI.connection.status", function (newConnection) {
                if (newConnection.isConnected) { //ensure we update the viewModel with the new connection details
                    thisWidget.options.viewModel.username(newConnection.UserName);
                    thisWidget.options.viewModel.errorMessage("");
                }
                thisWidget._update.call(thisWidget.options.viewModel.widget);
            });

            this._update();
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        _update: function () {
            this.options.viewModel.activeView(CIAPI.connection.isConnected ? 'LogOff' : 'LogOn');
            if (this.options.shakeOnError && this.options.viewModel.errorMessage()) {
                this.element.effect("shake", { times: 2 }, 100);
            }
            if (this.options.viewModel.errorMessage()) {
                this.element.find(".ui-state-error").hide().fadeIn('fast');
            }
            this._toggleInput({ isDisabled: false, parentElement: this.options.viewModel.widget.element });
        }
    });
})(jQuery);