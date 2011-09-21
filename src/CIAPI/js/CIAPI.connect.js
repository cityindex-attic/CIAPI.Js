var CIAPI = CIAPI || {};

(function(amplify,_,undefined) {

var EIGHT_HOURS = 8 * 60 * 60 * 1000, //in ms
    storeConnection = function(connection) {
        CIAPI.store({
            key:"CIAPI_connection",
            value: connection,
            storageType: "sessionStorage",
            expires: EIGHT_HOURS
        });
    },
    removeStoredConnection = function() {
        CIAPI.connection.isConnected = false;
        CIAPI.connection.UserName = "";
        CIAPI.connection.Session = "";
        CIAPI.connection.ServiceUri = "";
        CIAPI.connection.StreamUri = "";
        storeConnection(CIAPI.connection);
    };

//Init some defaults
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
        UserName: "not_specified",
        Password: "not_specified",
        ServiceUri: "not_specified",
        StreamUri:"not_specified",
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
                CIAPI.connection.UserName = connectionOptions.UserName;
                CIAPI.connection.ServiceUri = connectionOptions.ServiceUri;
                CIAPI.connection.StreamUri = connectionOptions.StreamUri;
                storeConnection(CIAPI.connection);
                CIAPI.publish("CIAPI.connection.status", CIAPI.connection);
                connectionOptions.success(data);
           },
           error: function( data ) {
                _(data).defaults({ ErrorCode: 0, ErrorMessage: "Unknown", HttpStatus: 0});
                removeStoredConnection();
                CIAPI.publish("CIAPI.connection.status", CIAPI.connection);
                connectionOptions.error(data);
           }
   });

};

/**
 * Reload the current connection from sessionStorage, and check that it is still valid
 * CIAPI.connection will be updated appropriately, and the updated connection status will 
 * be published to CIAPI.connection.status
 */
CIAPI.reconnect = function() {
    CIAPI.connection = _({}).extend(CIAPI.store({
                                key:"CIAPI_connection",
                                storageType: "sessionStorage"
                            }));
    
   if (!CIAPI.connection.isConnected) {
        CIAPI.publish("CIAPI.connection.status", CIAPI.connection);
        return;
   }

    //Validate the existing connection by trying to use it
    //An error will be trapped by the 401 error trapper below
    amplify.request( {
        resourceId: "GetClientAndTradingAccount",
        data:  {
                    ServiceUri: CIAPI.connection.ServiceUri,
                    UserName: CIAPI.connection.UserName,
                    Session: CIAPI.connection.Session
                },
        success:  function( data ) {
            CIAPI.publish("CIAPI.connection.status", CIAPI.connection);
        }
    });
};


/**
 * 401 error trapper
 * Trap any 401 request errors and update the CIAPI.connection status
 */
CIAPI.subscribe("CIAPI.request.error", function(errorMessage) {
    if (errorMessage.HttpStatus === 401) {
        removeStoredConnection();
        CIAPI.publish("CIAPI.connection.status", CIAPI.connection);
    }
});

/**
 * Disconnect from the CIAPI
 */
CIAPI.disconnect = function(options) {
   options = options || {};
   _(options).defaults({
        UserName: CIAPI.connection.UserName,
        Session: CIAPI.connection.Session,
        ServiceUri: CIAPI.connection.ServiceUri,
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
                removeStoredConnection();
                CIAPI.publish("CIAPI.connection.status", CIAPI.connection);
                options.success(data);
           },
           error: function( data ) {
                options.error(data);
           }
   });
};

CIAPI.replaceConnectionTokens = function (input) {
    if (!CIAPI.connection.isConnected) {
        console.log("Warning:  replaceTokens should not be called before authentication has happened, or not all tokens will be replaced");
    }
    return input.replace("{CIAPI.connection.UserName}", CIAPI.connection.UserName)
                .replace("{CIAPI.connection.Session}", CIAPI.connection.Session);

};

})(amplify, _);