var CIAPI = CIAPI || {};

(function(amplify,_,undefined) {

CIAPI.connection = CIAPI.store("CIAPI.connection") || {};
_(CIAPI.connection).defaults({
        isConnected : false,
        UserName: "",
        Session: "",
        ServiceUri: "",
        StreamUri: ""
});

/**
 * Connect to the CIAPI
 * @param connectionOptions
 */
CIAPI.connect = function(connectionOptions) {
   _(connectionOptions).defaults({
        UserName: CIAPI.connection.UserName,
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
                CIAPI.connection.UserName = connectionOptions.UserName;
                CIAPI.connection.Session = data.Session;
                CIAPI.store("CIAPI.connection", CIAPI.connection);
                CIAPI.storeInCookie("UserName", CIAPI.connection.UserName);
                CIAPI.storeInCookie("Session", CIAPI.connection.Session);
                connectionOptions.success(data);
           },
           error: function( data ) {
                CIAPI.connection.isConnected = false;
                CIAPI.connection.Session = "";
                CIAPI.store("CIAPI.connection", CIAPI.connection);
                CIAPI.storeInCookie("UserName", "");
                CIAPI.storeInCookie("Session", "");
                connectionOptions.error(data);
           }
   });

};

/**
 * Disconnect from the CIAPI
 */
CIAPI.disconnect = function(options) {
   options = options || {};
   _(options).defaults({
        success: function () {},
        error: function() {}
   });

   amplify.request( {
           resourceId: "DeleteSession",
           data:  {
                      ServiceUri: options.ServiceUri,
                      UserName: options.UserName,
                      Session: options.Session
                  },
           success:  function( data ) {
                CIAPI.connection.isConnected = false;
                CIAPI.connection.UserName = "";
                CIAPI.connection.Session = "";
                CIAPI.store("CIAPI.connection", CIAPI.connection);
                CIAPI.storeInCookie("UserName", "");
                CIAPI.storeInCookie("Session", "");
                options.success(data);
           },
           error: function( data ) {
                options.error(data);
           }
   });

};


})(amplify, _);