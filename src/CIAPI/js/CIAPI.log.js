if (typeof console == "undefined" || typeof console.log == "undefined") var console = { log: function () { } };

CIAPI.log = function(message) {
    console.log(message);
};