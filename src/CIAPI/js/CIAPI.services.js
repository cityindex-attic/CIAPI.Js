var CIAPI = CIAPI || {};

/**
    @namespace A collection of services that you can call
*/
CIAPI.services = (function() {

    return {
        /**
         * Search for markets of type CFD
         * @param searchByMarketName
         * @param searchByMarketCode
         * @param maxResults
         */
        ListCfdMarkets: function(searchByMarketName, searchByMarketCode, maxResults) {
            if (maxResults > 1000) throw { message: "Can only return a maximum of 1000 pricebars" };


            var markets = CIAPI.dojo.clone(CIAPI.__testData.MarketList.slice(0, maxResults));
            for (var idx in markets) {
                markets[idx].Name = markets[idx].Name.replace("{marketName}", searchByMarketName);
            }
            return markets;
        },
        GetPriceBars: function(marketId, interval, span, priceBars) {
            var idx, marketPriceBars=[];

            if (interval !== 'minute') throw { message: "Only interval of 'minute' is currently supported" };
            if (priceBars > 1000) throw { message: "Can only return a maximum of 1000 pricebars" };

            for(idx in CIAPI.__testData.MarketList)
            {

                if (CIAPI.__testData.MarketList[idx].MarketId == marketId){
                    marketPriceBars = CIAPI.__testData.MarketList[idx].PriceHistory;
                    break;
                }
            }

            return {
                PartialPriceBar: CIAPI.dojo.clone(marketPriceBars.minute[0]),
                PriceBars: CIAPI.dojo.clone(marketPriceBars.minute.slice(1, priceBars + 1))
            };
        }
    };

})();