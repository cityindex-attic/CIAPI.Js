(function(amplify, _, undefined) {
   amplify.request.decoders.ciapiDecoder = function ( data, status, xhr, success, error ) {
        if ( !data.ErrorCode ) {
            success( data );
        } else {
            error( data );
        }
    };

   amplify.request.define( "createSession", "cors", {
        url: "{ServiceUri}/session?only200=true",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "POST",
        processData: false,
        beforeSend: function(xhr, settings) {
                        settings.data = JSON.stringify(settings.data);
                        return true;
                  },
        decoder: "ciapiDecoder"

    });

  amplify.request.define("DeleteSession", "cors", {
        url: "{ServiceUri}/deleteSession?userName={UserName}&session={Session}&only200=true",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "POST",
        decoder: "ciapiDecoder"
    });

   amplify.request.define( "ListCfdMarkets", "cors", {
        url: "{ServiceUri}/cfd/markets?MarketName={searchByMarketName}&MarketCode={searchByMarketCode}&ClientAccountId={clientAccountId}&MaxResults={maxResults}&only200=true",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "GET",
        decoder: "ciapiDecoder"
   });

   amplify.request.define( "GetPriceBars", "cors", {
        url: "{ServiceUri}/market/{marketId}/barhistory?interval={interval}&span={span}&priceBars={maxResults}&only200=true",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "GET",
        decoder: "ciapiDecoder"
   });

})(amplify, _);