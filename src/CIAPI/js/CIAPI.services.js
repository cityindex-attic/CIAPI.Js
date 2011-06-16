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

        GetPriceBars: function(options) {
            _(options).defaults({
                MarketId: undefined,
                Interval: 'minute',
                Span: 1,
                MaxResults: 25,
                success: function () {},
                error: function() {}
           });

           amplify.request( {
                   resourceId: "GetPriceBars",
                   data:  {
                              ServiceUri: CIAPI.connection.ServiceUri,
                              marketId: options.MarketId,
                              interval: options.Interval,
                              span: options.Span,
                              maxResults: options.MaxResults
                          },
                   success:  function( data ) {
                        options.success(data);
                   },
                   error: function( data ) {
                        options.error(data);
                   }
           });
        }
    };

})();