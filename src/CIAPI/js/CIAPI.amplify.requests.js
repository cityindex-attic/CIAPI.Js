(function(amplify, _, undefined) {
   amplify.request.decoders.ciapiDecoder = function ( data, status, xhr, success, error ) {
        if (status==="timeout") {
            error(new CIAPI.dto.ApiErrorResponseDTO(503, 503, "Request timed out when contacting server"));
            return;
        }

        if ( !_(data).isNull() && !_(data).isUndefined(data) && !data.ErrorCode ) {
            success( data );
        } else {
            error( data );
        }
    };

   amplify.request.define( "createSession", "cors", {
        url: "{ServiceUri}/session?only200=true",
        timeout:5000,
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
        url: "{ServiceUri}/session?_method=DELETE&only200=true",
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