(function (amplify, _, undefined) {

    CIAPI.subscribe = function (topic, callback) {

        return amplify.subscribe(topic, callback);
    }

    CIAPI.publish = function (topic, message) {

        return amplify.publish(topic, message);
    }


})(amplify, _);