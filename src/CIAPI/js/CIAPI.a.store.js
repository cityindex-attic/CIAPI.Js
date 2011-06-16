(function (amplify, _, undefined) {

    CIAPI.store = function (key, value, options) {

        return amplify.store(key, value, options);
    }
})(amplify, _);