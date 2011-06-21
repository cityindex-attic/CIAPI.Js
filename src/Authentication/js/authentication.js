(function ($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {
            width: 600,
            afterLogOn: function (message) { },
            afterLogOff: function (message) { },
            template: $.template('defaultAuthWidgetTemplate',
                '<div id="login_message"></div>                                                              ' +
                '<p>                                                                                         ' +
                '    <label for="username">Username<br />                                                    ' +
                '    <input type="text"                                                                      ' +
                '            name="username"                                                                 ' +
                '            id="username"                                                                   ' +
                '            class="inputFields"                                                             ' +
                '            data-bind="value: username"                                                     ' +
                '            size="20"                                                                       ' +
                '            tabindex="1" />                                                                 ' +
                '    </label>                                                                                ' +
                '</p>                                                                                        ' +
                '<p>                                                                                         ' +
                '    <label for="password">Password<br />                                                    ' +
                '    <input type="password"                                                                  ' +
                '            name="password"                                                                 ' +
                '            id="password"                                                                   ' +
                '            class="inputFields"                                                             ' +
                '            data-bind="value: password"                                                     ' +
                '            size="20"                                                                       ' +
                '            tabindex="2" />                                                                 ' +
                '    </label>                                                                                ' +
                '</p>                                                                                        ' +
                '<p class="submit">                                                                          ' +
                '    <button id="doLogOnButton" data-bind="click: doLogOn" tabindex="3">Log on</button>' +
                '</p>                                                                                        ')
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