(function(amplify, _, undefined) {

   amplify.request.define( "createSession", function(settings) {
       if (settings.data.UserName === "CC735158" && settings.data.Password==="password") {
           settings.success(new CIAPI.dto.CreateSessionResponseDTO("{ef4923-mock-session-token-fe552}"));
       } else {
           settings.error(new CIAPI.dto.ApiErrorResponseDTO(401, 4001, "Invalid username or password"));
       }
   });

   amplify.request.define( "ListCfdMarkets", function(settings) {
        if (settings.data.searchByMarketName === "GBP") {
            settings.success(new CIAPI.dto.ListCfdMarketsResponseDTO(JSON.parse('[{"MarketId":400516270,"Name":"GBP\/USD"}]')));
            return;
        }
        if (settings.data.searchByMarketName === "US") {
            settings.success(new CIAPI.dto.ListCfdMarketsResponseDTO(JSON.parse('[{"MarketId":400520618,"Name":"US Crude Oil"}]')));
            return;
        }
        if (settings.data.searchByMarketName === "UK") {
            settings.success(new CIAPI.dto.ListCfdMarketsResponseDTO(JSON.parse('[{"MarketId":400509815,"Name":"UK 100"}]')));
            return;
        }
        settings.error(new CIAPI.dto.ApiErrorResponseDTO(403, 4003, "Unknown market"));
   });

})(amplify, _);