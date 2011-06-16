(function ($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: { template: 'defaultAuthWidgetTemplate' },
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
                '</p>                                                                                        '),
        viewModel: {
            username: ko.observable(CIAPI.connection.UserName),
            password: ko.observable("")
        },
        _doLogOn: function () {
            var viewModel = this;
            CIAPI.connect({
                UserName: viewModel.username(),
                Password: viewModel.password(),
                success: function (data) {
                    viewModel.widget._update();
                },
                error: function (data) {
                    viewModel.widgetElement.find(".ui-widget").effect("shake", { times: 2 }, 100);
                    viewModel.widgetElement.find("#login_message")
                            .addClass('ui-state-error')
                            .html('<strong>ERROR</strong>: ' + data.ErrorMessage);
                }
            });
        },
        _doLogOff: function () {
            CIAPI.disconnect();
            this.widget._update();
        },
        _create: function () {
            this.viewModel.doLogOn = this._doLogOn;
            this.viewModel.doLogOff = this._doLogOff;
            this.viewModel.widgetElement = this.element;
            this.viewModel.widget = this;

            this.element.addClass('CIAPI_AuthenticationWidget');
            $.tmpl(this.options.template, {}).appendTo(this.element);

            ko.applyBindings(this.viewModel, this.element.get(0));
            this.element.find("#doLogOnButton").button();
            this.element.find("#doLogOffButton").button();
            this._update();
        },
        destroy: function () {
            this.element.removeClass('CIAPI_AuthenticationWidget');
            $.Widget.prototype.destroy.call(this);
        },
        _update: function () {
            if (CIAPI.connection.isConnected) {
                this.element.find('#LogOnView').hide();
                this.element.find('#LogOffView').show();
            }
            else {
                this.element.find('#LogOnView').show();
                this.element.find('#LogOffView').hide();
            }
            //this.element.text(new Date());
        }
    });
})(jQuery);