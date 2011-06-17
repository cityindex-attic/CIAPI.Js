/**
    @namespace CityIndex API javascript client library
*/
var CIAPI = CIAPI || {};

/**
    @namespace DTOs relating to the API
*/
CIAPI.dto = CIAPI.dto || {};

CIAPI.version = "0.1";
CIAPI.settings = {

};

CIAPI.parseDate = function(value) {
    if (value.toString().indexOf('Date') >= 0) {
        //here we will try to extract the ticks from the Date string in the "value" fields of JSON returned data
        a = /^\/Date\((-?[0-9]+)\)\/$/.exec(value);
        if (a) {
            return new Date(parseInt(a[1], 10));
        }
    }
};

if (typeof Object.freeze == "undefined") { Object.freeze = function () { }; }

if (typeof String.trim == "undefined") {
    String.prototype.trim = function () {
        return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
    };
}