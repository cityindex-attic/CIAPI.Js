var CIAPI = CIAPI || {};

CIAPI.streams = (function() {

    return {
        ListenToPrice: function(marketId, callBack) {
            setInterval(function() {
                var change,
                    direction,
                    _priceBars = CIAPI.__testData.PriceBars;
                direction = Math.random() > 0.5 ? 1 : -1;
                change = direction * _priceBars.minute[0].Close * 0.05;
                _priceBars.minute[0].Close += change;
                _priceBars.minute[0].High = (_priceBars.minute[0].Close > _priceBars.minute[0].High) ? _priceBars.minute[0].Close : _priceBars.minute[0].High;
                _priceBars.minute[0].Low = (_priceBars.minute[0].Close < _priceBars.minute[0].Low) ? _priceBars.minute[0].Close : _priceBars.minute[0].Low;
                callBack({
                    MarketId: marketId,
                    bid : _priceBars.minute[0].Close,
                    offer : _priceBars.minute[0].Close,
                    high : _priceBars.minute[0].High,
                    low : _priceBars.minute[0].Low,
                    change : change
                });
            }, Math.random() * 5000 + 1000);
        }
    }

})();