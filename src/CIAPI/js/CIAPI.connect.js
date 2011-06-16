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
        ServiceUri: CIAPI.connection.ServiceUri,
        StreamUri: CIAPI.connection.StreamUri,
        success: function () {},
        error: function() {}
   });

   amplify.request( {
           resourceId: "createSession",
           data:  {
                      ServiceUri: connectionOptions.ServiceUri,
                      UserName: connectionOptions.UserName,
                      Password: connectionOptions.Password
                  },
           success:  function( data ) {
                CIAPI.connection.isConnected = true;
                CIAPI.connection.Session = data.Session;
                connectionOptions.success(data);
           },
           error: function( data ) {
                CIAPI.connection.isConnected = false;
                CIAPI.connection.Session = "";
                connectionOptions.error(data);
           }
   });

};

})(amplify, _);