(function ($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {
            width: 600,
            afterLogOn: function (message) { },
            afterLogOff: function (message) { },
            template: $.template('defaultAuthWidgetTemplate',
                '<div class="ui-ciapi-authentication ui-widget ui-corner-all">                                                '+
                '    <div class="ui-ciapi-authentication-titlebar ui-widget-header ui-helper-clearfix">                       '+
                '        <span class="ui-ciapi-authentication-title">Logon Form</span>                                        '+
                '    </div>                                                                                                   '+
                '    <div class="ui-ciapi-logon-view" data-bind="visible: activeView() === \'LogOn\'">                        '+
                '        <div class="ui-ciapi-authentication-content ui-widget-content">                                      '+
                '            <p class="ui-state-error" data-bind="text: errorMessage, visible: errorMessage().length > 0"></p>'+
                '            <fieldset>                                                                                       '+
                '                <label for="username">UserName</label>                                                       '+
                '                <input type="text"                                                                           '+
                '                       name="username"                                                                       '+
                '                       id="username"                                                                         '+
                '                       class="inputFields"                                                                   '+
                '                       data-bind="value: username"/>                                                         '+
                '                <label for="password">Password</label>                                                       '+
                '                <input type="password"                                                                       '+
                '                       name="password"                                                                       '+
                '                       id="password"                                                                         '+
                '                       class="inputFields"                                                                   '+
                '                       data-bind="value: password"/>                                                         '+
                '            </fieldset>                                                                                      '+
                '        </div>                                                                                               '+
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix">                '+
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOn">Log on</button>        '+
                '        </div>                                                                                               '+
                '    </div>                                                                                                   '+
                '    <div class="ui-ciapi-logoff-view" data-bind="visible: activeView() === \'LogOff\'">                      '+
                '        <div class="ui-ciapi-authentication-content ui-widget-content">                                      '+
                '            <p>You are logged in as <span data-bind="text: username"/></p>                                   '+
                '        </div>                                                                                               '+
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix">                '+
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOff">Log off</button>      '+
                '        </div>                                                                                               '+
                '    </div>                                                                                                   '+
                '</div>')
        },
        _createViewModel: function(widgetRef) {
          return {
                widget: widgetRef,     //Store a reference to this instance of the widget for use in viewModel event handling functions
                username: ko.observable(CIAPI.connection.UserName),
                password: ko.observable(""),
                activeView: ko.observable("LogOn"),
                errorMessage: ko.observable(""),
                doLogOn: function () {
                    var viewModel = this;
                    CIAPI.connect({
                        UserName: viewModel.username(),
                        Password: viewModel.password(),
                        success: function (data) {
                            viewModel.widget.options.afterLogOn(CIAPI.connection);
                            viewModel.errorMessage("");
                            viewModel.widget._update();
                        },
                        error: function (data) {
                            viewModel.errorMessage('ERROR: ' + data.ErrorMessage);
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
        _create: function () {
            //The viewModel needs to be created here rather than defined in options above to prevent cross widget pollution
            this.options.viewModel = this._createViewModel(this);

            $.tmpl(this.options.template, {}).appendTo(this.element);

            ko.applyBindings(this.options.viewModel, this.element.get(0));

            this.element.css('width', this.options.width);

            this.element.find(".ui-ciapi-authentication-button").button();

            this._update();
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this);
        },
        _update: function () {
            var activeView = CIAPI.connection.isConnected ? 'LogOff' : 'LogOn';
            this.options.viewModel.activeView(activeView);

            if (this.options.viewModel.errorMessage()) {
                this.element.effect("shake", { times: 2 }, 100);
            }
        }
    });
})(jQuery);