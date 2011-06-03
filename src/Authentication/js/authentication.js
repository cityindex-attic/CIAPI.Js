(function($, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {template: 'defaultAuthWidgetTemplate'},
        template: $.template('defaultAuthWidgetTemplate',
                '<div id="login_message"></div>                                                              '+
                '<p>                                                                                         '+
                '    <label for="username">Username<br />                                                    '+
                '    <input type="text"                                                                      '+
                '            name="username"                                                                 '+
                '            id="username"                                                                   '+
                '            class="inputFields"                                                             '+
                '            data-bind="value: username"                                                     '+
                '            size="20"                                                                       '+
                '            tabindex="1" />                                                                 '+
                '    </label>                                                                                '+
                '</p>                                                                                        '+
                '<p>                                                                                         '+
                '    <label for="password">Password<br />                                                    '+
                '    <input type="password"                                                                  '+
                '            name="password"                                                                 '+
                '            id="password"                                                                   '+
                '            class="inputFields"                                                             '+
                '            data-bind="value: password"                                                     '+
                '            size="20"                                                                       '+
                '            tabindex="2" />                                                                 '+
                '    </label>                                                                                '+
                '</p>                                                                                        '+
                '<p class="submit">                                                                          '+
                '    <button id="doAuthenticationButton"  data-bind="click: doAuthentication" tabindex="3">Log on</button>'+
                '</p>                                                                                        '),
        viewModel: {
            username: ko.observable("Your username"),
            password: ko.observable("your password")
        },
        _doAuthentication: function() {
                var authDTO = {
                    UserName: this.username(),
                    Password: this.password()
                };
                console.log("TODO: authenticate with CIAPI using", authDTO);
                console.log('inside _doAuthentication, this is',this);
                this.widgetElement.find(".CIAPI_AuthenticationWidget").effect("shake", {times:2}, 100);
                this.widgetElement.find("#login_message")
                    .addClass('ui-state-error')
                    .html('<strong>ERROR</strong>: Your details were incorrect.<br />');
        },
        _create: function() {
            this.viewModel.doAuthentication = this._doAuthentication;
            this.viewModel.widgetElement = this.element;

            this.element.addClass('CIAPI_AuthenticationWidget');
            $.tmpl(this.options.template, {}).appendTo(this.element);

            ko.applyBindings(this.viewModel, this.element.get(0));
            this.element.find("#doAuthenticationButton").button();
            this._update();
        },
        destroy: function() {
            this.element.removeClass('CIAPI_AuthenticationWidget');
            $.Widget.prototype.destroy.call(this);
        },
        _update: function() {
            this.element.text(new Date());
        }
    });
})(jQuery);