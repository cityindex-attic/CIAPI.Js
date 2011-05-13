var CIAPI = CIAPI || {};

CIAPI.__testData = (function() {

   var
    _i,
    _marketList = [],
    _priceBars = {
        minute: []
    },
    _generateNextPrice = function (lastPrice) {
        var direction = Math.random() > 0.5 ? 1 : -1;
        return lastPrice.Close + (direction * lastPrice.Close * 0.05);
    },
    _createPriceBar = function(previousBar, interval) {
        var intervalInMs = {
            minute: 1000 * 60,
            hour:  1000 * 60 * 60,
            day: 1000 * 60 * 60 * 24
        };
        var theDate = new Date(previousBar.BarDate.getTime() - intervalInMs[interval]);
        var close = _generateNextPrice(previousBar);
        return {
            "BarDate":theDate,
            "Close": close,
            "High": close * 1.1,
            "Low":close * 0.9,
            "Open":previousBar.Close
        };
    },
    _currentBar = {
        "BarDate":new Date(),
        "Close":1.6283,
        "High":1.6285,
        "Low":1.6283,
        "Open":1.6284
    };

    for (_i = 0; _i <= 1000; _i++) {
        _priceBars.minute.push(_currentBar);
        _currentBar = _createPriceBar(_currentBar, 'minute');

        _marketList.push({
            "MarketId": 10000 + _i,
            "Name": "{marketName} CFD #" + (_i + 1)
        });
    }

    return {
        PriceBars: _priceBars,
        MarketList: _marketList
    };

})();