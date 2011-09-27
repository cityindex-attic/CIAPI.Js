(function (amplify, _, undefined) {

    CIAPI.store = function (options) {
       return amplify.store(options.key, options.value, options);
    }

})(amplify, _);