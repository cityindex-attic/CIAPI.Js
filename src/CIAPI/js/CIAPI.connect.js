var CIAPI = CIAPI || {};

(function(amplify,_,undefined) {

CIAPI.connection = {
        isConnected : false,
        UserName: "",
        Session: "",
        ServiceUri: "",
        StreamUri: ""
};
/**
 * Connect to the CIAPI
 * @param connectionOptions
 */
CIAPI.connect = function(connectionOptions) {
   _(connectionOptions).defaults({
        UserName: undefined,
        Password: undefined,
        ServiceUri: undefined,
        StreamUri: undefined,
        onSuccess: function () {},
        onError: function() {}
   });

   amplify.request.define( "createSession", "ajax", {
        url: connectionOptions.ServiceUri + "/session?only200=true",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "POST",
        decoder: function ( data, status, xhr, success, error ) {
            if ( !data.ErrorCode ) {
                success( data );
            } else {
                error( data, data.ErrorCode );
            }
        }

   });

   amplify.request( {
           resourceId: "createSession",
           data: JSON.stringify(
                           {
                               "UserName": connectionOptions.UserName,
                               "Password": connectionOptions.Password
                           }),
           success:  function( data ) {
                         CIAPI.connection.isConnected = true;
                         CIAPI.connection.Session = data.Session;
                         connectionOptions.onSuccess(data);
           },
           error: function(data, errorCode) {
               connectionOptions.onError(data, errorCode);
           }
   });


};

})(amplify, _);