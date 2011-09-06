var CIAPI = CIAPI || {};
(function($,undefined) {
    function ensureIsDefined(object, objectName) {
        if (object === undefined) {
            CIAPI.log(objectName + 'must be referenced');
        }
    }
    ensureIsDefined($, 'jQuery 1.5.2+');
    ensureIsDefined($.widget, 'jQuery UI 1.8+');

    $.widget("ui.CIAPI_widget", {
	    version: "@VERSION",
        options: {
            dependencies: [ {obj:$, description: "jQuery 1.5.2+" }, {obj:$.widget, description: "jQuery UI 1.8+"} ]
        },
        _checkDependencies: function() {
            for(var idx in dependencies) {
                ensureIsDefined(dependencies[idx].obj, dependencies[idx].description);
            }
        }
    });

    /*  Hook into the jQuery globalize library.  This can be removed when JQueryUI
    Natively supports jQuery globalization - http://wiki.jqueryui.com/w/page/39118647/Globalize */
    $.widget.addCultureInfo = function( cultureName, extendCultureName, info ) {
        return Globalize.addCultureInfo(cultureName, extendCultureName, info);
    };
    
    $.widget.getCurrentCulture = function() {
        return Globalize.culture();
    };

    $.widget.culture = function( selector ) {
        Globalize.culture(selector);
    };

    $.widget.localize = function( key, culture ) {
        return Globalize.localize(key, culture);
    };

    $.widget.format = function(value, format, culture ) {
        return Globalize.format(value, format, culture);
    };

    $.widget.parseDate = function( value, formats, culture ) {
        return Globalize.parseDate(value, formats, culture);
    };

    $.widget.parseInt = function( value, radix, culture ) {
        return Globalize.parseInt(value, radix, culture);
    };

    $.widget.parseFloat = function( value, culture ) {
        return Globalize.parseFloat(value, culture);
    };

}(jQuery));