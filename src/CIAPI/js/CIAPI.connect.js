var CIAPI = CIAPI || {};

(function(amplify,_,undefined) {

var EIGHT_HOURS = 8 * 60 * 60 * 1000, //in ms
    VALIDATE_CONNECTION_POLL_MS = 20 * 60 * 1000;

var storeConnection = function(connection) {
    CIAPI.store({
        key:"CIAPI_connection",
        value: connection,
        storageType: "sessionStorage",
        expires: EIGHT_HOURS
    });

    if (connection.isConnected) {
       startConnectionValidationPolling();
    } else {
       stopConnectionValidationPolling();
    }
};

var loadConnection = function() {
    CIAPI.connection = _({}).extend(CIAPI.store({
                                key:"CIAPI_connection",
                                storageType: "sessionStorage"
                            }));
    _(CIAPI.connection).defaults({
        isConnected : false,
        UserName: "",
        Session: "",
        ServiceUri: "",
        StreamUri: ""
    });
};

var removeConnection = function() {
    CIAPI.connection.isConnected = false;
    CIAPI.connection.UserName = "";
    CIAPI.connection.Session = "";
    storeConnection(CIAPI.connection);
}

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

   var createSessionRequest = amplify.request( {
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
                storeConnection(CIAPI.connection);
                connectionOptions.success(data);
           },
           error: function( data ) {
                _(data).defaults({ ErrorCode: 0, ErrorMessage: "Unknown", HttpStatus: 0});
                removeConnection();
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
                removeConnection();
                options.success(data);
           },
           error: function( data ) {
                options.error(data);
           }
   });
};

/**
 * Event - fired whenever the connection state changes
 * @param connection
 */
CIAPI.OnConnectionInvalid = function(connection) {

}
/**
 * Check if the current connection is still valid
 * If connection not valid, remove stored connection and raise OnConnectionInvalid event
 */
CIAPI.validateConnection = function() {
   if (!CIAPI.connection.isConnected) 
        return;  // no use validating an invalid connection!
   amplify.request( {
           resourceId: "GetClientAndTradingAccount",
           data:  {
                      ServiceUri: CIAPI.connection.ServiceUri,
                      UserName: CIAPI.connection.UserName,
                      Session: CIAPI.connection.Session
                  },
           success:  function( data ) {
              //Do nothing - connection is still valid 
           },
           error: function( data ) {
               if (data.HttpStatus === 401) {
                  removeConnection();
                  CIAPI.OnConnectionInvalid(CIAPI.connection);
               }
           }
   });
};

var isConnectionValidationPollingActive = false;
var startConnectionValidationPolling = function() {
    isConnectionValidationPollingActive = true;
    (function recursiveSetTimeout() {
        if (isConnectionValidationPollingActive) {
            setTimeout(function() {
                CIAPI.validateConnection();

                recursiveSetTimeout();
            }, VALIDATE_CONNECTION_POLL_MS)
        }
    })();
}
var stopConnectionValidationPolling = function() {
    isConnectionValidationPollingActive = false;
}

/**
 *  Init
 */
loadConnection();
CIAPI.validateConnection();

})(amplify, _);