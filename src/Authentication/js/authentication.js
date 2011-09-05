(function ($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {
            width: 600,
            afterLogOn: function (CIAPIConnection) { },
            afterLogOff: function (CIAPIConnection) { },
            shakeOnError: false,
            template: $.template('defaultAuthWidgetTemplate',                                                                  
                '<div class="ui-ciapi-authentication ui-widget ui-widget-content ui-corner-all">                               '+
                '    <div class="ui-ciapi-logon-view  ui-corner-all" data-bind="visible: activeView() === \'LogOn\'">          '+
                '    <form class="ui-ciapi-authentication-form">    ' +
                    '<div class="ui-ciapi-authentication-content ui-widget-content ui-corner-top">                         '+
                '            <p class="ui-state-error" data-bind="text: errorMessage, visible: errorMessage().length > 0"></p> '+
                '            <fieldset>                                                                                        '+
                '                <label for="username">UserName</label>                                                        '+
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   '+
                '                    <input type="text"                                                                        '+
                '                       name="username"                                                                        '+
                '                       id="username"                                                                          '+
                '                       class="required inputFields"                                                                    '+
                '                       data-bind="value: username"/>                                                          '+
                '                </div>                                                                                        '+
                '                <label for="password">Password</label>                                                        '+
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   '+
                '                    <input type="password"                                                                    '+
                '                       name="password"                                                                        '+
                '                       id="password"                                                                          '+
                '                       class="required inputFields"                                                                    '+
                '                       data-bind="value: password"/>                                                          '+
                '                </div>                                                                                        '+
                '                                                                                                              '+
                '            </fieldset>                                                                                       '+
                '        </div>                                                                                                '+
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix ui-corner-bottom">'+
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOn">Log on</button>         '+
                '        </div>       ' +
                    '</form>                                                                                         '+
                '    </div>                                                                                                    '+
                '    <div class="ui-ciapi-logoff-view  ui-corner-all" data-bind="visible: activeView() === \'LogOff\'">        '+
                '        <div class="ui-ciapi-authentication-content ui-widget-content">                                       '+
                '            <p>You are logged in as <span data-bind="text: username"/></p>                                    '+
                '        </div>                                                                                                '+
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix">                 '+
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOff">Log off</button>       '+
                '        </div>                                                                                                '+
                '    </div>                                                                                                    '+
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
                    if (!viewModel.widget.element.find('.ui-ciapi-authentication-form').valid()) { return; }
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