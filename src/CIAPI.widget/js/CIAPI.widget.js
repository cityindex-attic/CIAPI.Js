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
}(jQuery));