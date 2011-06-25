(function ($, _, undefined) {
    $.widget("ui.CIAPI_widget_AuthenticationWidget", $.ui.CIAPI_widget, {
        options: {
            width: "100%",
            afterLogOn: function (message) { },
            afterLogOff: function (message) { },
            templates: [
                        {   name: "normal",
                            minWidth: Number.MIN_VALUE,
                            maxWidth:600,
                            template: $.template('defaultAuthWidgetTemplate',
                '<div class="ui-ciapi-authentication ui-widget ui-widget-content ui-corner-all">                               '+
                '    <div class="ui-ciapi-logon-view  ui-corner-all" data-bind="visible: activeView() === \'LogOn\'">          '+
                '        <div class="ui-ciapi-authentication-content ui-widget-content ui-corner-top">                         '+
                '            <p class="ui-state-error" data-bind="text: errorMessage, visible: errorMessage().length > 0"></p> '+
                '            <fieldset>                                                                                        '+
                '                <label for="username">UserName</label>  defaultAuthWidgetTemplate                                                      '+
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   '+
                '                    <input type="text"                                                                        '+
                '                       name="username"                                                                        '+
                '                       id="username"                                                                          '+
                '                       class="inputFields"                                                                    '+
                '                       data-bind="value: username"/>                                                          '+
                '                </div>                                                                                        '+
                '                <label for="password">Password</label>                                                        '+
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   '+
                '                    <input type="password"                                                                    '+
                '                       name="password"                                                                        '+
                '                       id="password"                                                                          '+
                '                       class="inputFields"                                                                    '+
                '                       data-bind="value: password"/>                                                          '+
                '                </div>                                                                                        '+
                '                                                                                                              '+
                '            </fieldset>                                                                                       '+
                '        </div>                                                                                                '+
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix ui-corner-bottom">'+
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOn">Log on</button>         '+
                '        </div>                                                                                                '+
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
                 {     name: "wide",
                     minWidth: 601,
                     maxWidth: Number.MAX_VALUE,
                     template: $.template('wideAuthWidgetTemplate',
                '<div class="ui-ciapi-authentication ui-widget ui-widget-content ui-corner-all">                               '+
                '    <div class="ui-ciapi-logon-view  ui-corner-all" data-bind="visible: activeView() === \'LogOn\'">          '+
                '        <div class="ui-ciapi-authentication-content ui-widget-content ui-corner-top">                         '+
                '            <p class="ui-state-error" data-bind="text: errorMessage, visible: errorMessage().length > 0"></p> '+
                '            <fieldset>' +
                        '        <table width="100%"><tr><td> wideAuthWidgetTemplate                                                                  '+
                '                <label for="username">UserName</label>                                                        '+
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   '+
                '                    <input type="text"                                                                        '+
                '                       name="username"                                                                        '+
                '                       id="username"                                                                          '+
                '                       class="inputFields"                                                                    '+
                '                       data-bind="value: username"/>                                                          '+
                '                </div>  ' +
                        '</td><td>                                                                                      '+
                '                <label for="password">Password</label>                                                        '+
                '                <div class="ui-ciapi-authentication-input ui-corner-all ui-widget-content">                   '+
                '                    <input type="password"                                                                    '+
                '                       name="password"                                                                        '+
                '                       id="password"                                                                          '+
                '                       class="inputFields"                                                                    '+
                '                       data-bind="value: password"/>                                                          '+
                '                </div>' +
                        '</td></tr><table>                                                                                     '+
                '                                                                                                              '+
                '            </fieldset>                                                                                       '+
                '        </div>                                                                                                '+
                '        <div class="ui-ciapi-authentication-buttonpane ui-widget-content ui-helper-clearfix ui-corner-bottom">'+
                '            <button class="ui-ciapi-authentication-button" data-bind="click: doLogOn">Log on</button>         '+
                '        </div>                                                                                                '+
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
                        }

                    ]
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
        /*
        Attaches a handler to the resize event to inject the relevant template
        for the current size of the container element
         */
        _injectTemplate: function(containerEl, templates, viewModel) {
            var currentTemplate = {  name: ""  };
            var lazyInject = _.debounce(function(evt){
                console.log("noticed a resize - considering injecting new template");
                var newTemplate = _(templates).filter(function(template) {
                    return template.minWidth <= containerEl.width()
                         && template.maxWidth >= containerEl.width();
                });
                if (newTemplate[0].template.name !== currentTemplate.name) {
                    currentTemplate = newTemplate[0];
                    console.log("injecting template",currentTemplate);
                    containerEl.empty();
                    $.tmpl(currentTemplate.template, {}).appendTo(containerEl);
                    containerEl.find(".ui-ciapi-authentication-button").button();
                    ko.applyBindings(viewModel, containerEl.get(0));
                }
            },100);
            $(window).resize(lazyInject);
            lazyInject();
        },
        _create: function () {
            //The viewModel needs to be created here rather than defined in options above to prevent cross widget pollution
            this.options.viewModel = this._createViewModel(this);

            this.element.css('width', this.options.width);

            this._injectTemplate(this.element, this.options.templates, this.options.viewModel);

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
})(jQuery, _);