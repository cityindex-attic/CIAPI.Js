(function (amplify, _, undefined) {

    CIAPI.store = function (options) {

        if (options.storageType.match(/^localStorage/i))
        {
            return amplify.store.localStorage(options.key, options.value, options);
        }
        else if (options.storageType.match(/^sessionStorage/i))
        {
            return amplify.store.sessionStorage(options.key, options.value, options);
        }
        else
        {
            return amplify.store(options.key, options.value, options);
        }
    }

})(amplify, _);