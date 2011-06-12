var CIAPI = CIAPI || {};

/**
    @namespace A collection of services that you can call
*/
CIAPI.services = (function() {

    return {
        /**
         * Search for markets of type CFD
         */
        ListCfdMarkets: function(options) {
            _(options).defaults({
                NameStartsWith: undefined,
                CodeStartsWith: undefined,
                MaxResults: 25,
                success: function () {},
                error: function() {}
           });

           amplify.request( {
                   resourceId: "ListCfdMarkets",
                   data:  {
                              ServiceUri: CIAPI.connection.ServiceUri,
                              searchByMarketName: options.NameStartsWith,
                              searchByMarketCode: options.CodeStartsWith,
                              maxResults: options.MaxResults
                          },
                   success:  function( data ) {
                        options.success(data);
                   },
                   error: function( data ) {
                        options.error(data);
                   }
           });
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