var CIAPI = CIAPI || {};

(function(amplify,undefined) {

/**
 * Connect to the CIAPI
 * @param connectionOptions
 */
CIAPI.connect = function(connectionOptions) {

   amplify.request.define( "createSession", "ajax", {
        url: connectionOptions.ServiceUri + "/session?only200=true",
        dataType: "json",
        type: "POST",
        decoder: function ( data, status, xhr, success, error ) {
//            if ( data.status === "success" ) {
//                success( data.data );
//            } else if ( data.status === "fail" || data.status === "error" ) {
//                error( data.message, data.status );
//            } else {
//                error( data.message , "fatal" );
//            }
        }
    });

    amplify.request( "createSession",
                      JSON.stringify(
                        {
                            "UserName": connectionOptions.UserName,
                            "Password": connectionOptions.Password
                        }),
                      function( data ) {
                          console.log(data);
                      }
    );


};

})(amplify);