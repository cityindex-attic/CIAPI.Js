var CIAPI = CIAPI || {};
(function($,undefined) {
    CIAPI.widget = {
        _checkDependencies: function() {
            function ensureIsDefined(object, objectName) {
                if (object === undefined) {
                    CIAPI.log(objectName + 'must be referenced');
                }
            }
            ensureIsDefined($, 'jQuery 1.5.1+');
            ensureIsDefined($.widget, 'jQuery UI 1.8+');
        }
    }
}(jQuery));