(function(amplify, _, undefined) {

   amplify.request.define( "createSession", function(settings) {
       if (settings.data.UserName === "CC735158" && settings.data.Password==="password") {
           settings.success(new CIAPI.dto.CreateSessionResponseDTO("{ef4923-mock-session-token-fe552}"));
       } else {
           settings.error(new CIAPI.dto.ApiErrorResponseDTO(401, 4001, "Invalid username or password"));
       }
   });

})(amplify, _);