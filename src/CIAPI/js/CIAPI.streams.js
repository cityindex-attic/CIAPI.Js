var CIAPI = CIAPI || {};

CIAPI.streams = (function() {
    var currentSubscriptions = {};

    return {
        SubscribeToPrice: function(options) {
            _(options).defaults({
                MarketId: undefined,
                message: function (price) { console.log(price)}
            });

            var topic = "PRICE."+options.MarketId;
            currentSubscriptions[topic] = amplify.subscribe(topic, function(data) {
                options.message(data);
                return true;
            });
        },
        UnsubscribeFromPrice:function(options) {
            var topic = "PRICE."+options.MarketId;
            amplify.unsubscribe(topic, currentSubscriptions[topic]);
        }
    };

})();