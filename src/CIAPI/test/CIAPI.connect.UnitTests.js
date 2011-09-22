describe("CIAPI.connect unit tests", function () {
    var EIGHT_HOURS = 8 * 60 * 60 * 1000, //in ms
    makeSuccessfulConnection = function () {
        runs(function () {
            CIAPI.connect({
                UserName: "CC735158",
                Password: "password",
                ServiceUri: "https://{the_service_Uri}/TradingApi",
                StreamUri: "https://{the_streaming_Uri}/"
            });
        });

        waitsFor(function () {
            return CIAPI.connection.isConnected;
        });
    };

    it("should create a session", function () {
        makeSuccessfulConnection();

        runs(function () {
            expect(CIAPI.connection.Session).toBeTruthy();
        });

    });

    it("creating a session should publish an message to CIAPI.connection.status", function () {
        var publishedConnection, statusUpdateWasPublished = false;

        CIAPI.subscribe("CIAPI.connection.status", function (message) {
            statusUpdateWasPublished = true;
            publishedConnection = message;
        });

        makeSuccessfulConnection();

        runs(function () {
            expect(statusUpdateWasPublished).toBeTruthy();
            expect(publishedConnection.isConnected).toBeTruthy();
            expect(publishedConnection.UserName).toBe("CC735158");
        });

    });


    it("should handle an error 500", function () {

        runs(function () {
            var that = this;
            CIAPI.connect({
                UserName: "causeError-500",
                Password: "password",
                error: function (data) {
                    console.log(data);
                    that.responseRecieved = true;
                    that.error = data;
                }
            });
        });

        waitsFor(function () {
            return this.responseRecieved;
        });

        runs(function () {
            console.log(CIAPI.connection);
            expect(this.error.HttpStatus).toBe(500);
            expect(CIAPI.connection.Session).toBeFalsy();
        });

    });

    it("should handle a lack of response from the server", function () {

        runs(function () {
            var that = this;
            CIAPI.connect({
                UserName: "causeError-timeout",
                Password: "password",
                error: function (data) {
                    console.log(data);
                    that.responseRecieved = true;
                    that.error = data;
                }
            });
        });

        waitsFor(function () {
            return this.responseRecieved;
        });

        runs(function () {
            console.log(CIAPI.connection);
            expect(this.error.HttpStatus).toBe(503);
            expect(CIAPI.connection.Session).toBeFalsy();
        });

    });


    it("should report an error for an invalid login", function () {

        runs(function () {
            var that = this;
            CIAPI.connect({
                UserName: "invalid",
                Password: "invalid",
                error: function (data) {
                    console.log(data);
                    that.responseRecieved = true;
                    that.error = data;
                }
            });
        });

        waitsFor(function () {
            return this.responseRecieved;
        });

        runs(function () {
            console.log(CIAPI.connection);
            expect(this.error.HttpStatus).toBe(401);
            expect(CIAPI.connection.Session).toBeFalsy();
        });

    });

    it("reconnect should publish connection status to CIAPI.connection.status", function () {

        var publishedConnection, statusUpdateWasPublished = false;

        CIAPI.subscribe("CIAPI.connection.status", function (message) {
            statusUpdateWasPublished = true;
            publishedConnection = message;
        });

        makeSuccessfulConnection();

        runs(function () {
            CIAPI.reconnect();
        });

        waitsFor(function () {
            return statusUpdateWasPublished;
        });

        runs(function () {
            expect(publishedConnection.isConnected).toBeTruthy();
            expect(publishedConnection.UserName).toBe("CC735158");
        });

    });

    it("reconnect should remove the stored connection when 401 error received", function () {

        var publishedConnection,
            statusUpdateWasPublished = false,
            oldGetClientAndTradingAccount = amplify.request.resources.GetClientAndTradingAccount;

        makeSuccessfulConnection();

        //Override
        amplify.request.resources.GetClientAndTradingAccount = function (settings) {
            amplify.request.decoders.ciapiDecoder(
                new CIAPI.dto.ApiErrorResponseDTO(401, 4010, "The credentials used to authenticate are invalid. Either the username, password or both are incorrect."),
                "success", {}, settings.success, settings.error
            );
        };

        CIAPI.subscribe("CIAPI.connection.status", function (message) {
            statusUpdateWasPublished = true;
            publishedConnection = message;
        });

        runs(function () {
            CIAPI.reconnect();
        });

        waitsFor(function () {
            return statusUpdateWasPublished;
        });

        runs(function () {
            expect(publishedConnection.isConnected).toBeFalsy();

            //Restore 
            amplify.request.resources.GetClientAndTradingAccount = oldGetClientAndTradingAccount;
        });
    });

    it("any 401 error should update the connection status", function () {

        var publishedConnection, statusUpdateWasPublished = false;

        makeSuccessfulConnection();

        CIAPI.subscribe("CIAPI.connection.status", function (message) {
            statusUpdateWasPublished = true;
            publishedConnection = message;
        });

        runs(function () {
            amplify.request({
                resourceId: "apiError",
                errorResponse: new CIAPI.dto.ApiErrorResponseDTO(401, 4010, "The credentials used to authenticate are invalid. Either the username, password or both are incorrect.")
            });
        });

        waitsFor(function () {
            return statusUpdateWasPublished;
        });

        runs(function () {
            expect(publishedConnection.isConnected).toBeFalsy();
            expect(publishedConnection.UserName).toBe("");
        });

    });

    it("connect should store the connection details in localStorage", function () {
        if (!CIAPI.store.isSpy)
            spyOn(CIAPI, "store");

        runs(function () {
            CIAPI.connect({
                UserName: "CC735158",
                Password: "password",
                ServiceUri: "https://{the_service_Uri}/TradingApi",
                StreamUri: "https://{the_streaming_Uri}/"
            });
        });

        waitsFor(function () {
            return CIAPI.connection.isConnected;
        });

        runs(function () {
            expect(CIAPI.store).toHaveBeenCalledWith({
                key: "CIAPI_connection",
                value: {
                    isConnected: true,
                    UserName: 'CC735158',
                    Session: '{ef4923-mock-session-token-fe552}',
                    ServiceUri: "https://{the_service_Uri}/TradingApi",
                    StreamUri: "https://{the_streaming_Uri}/"
                },
                storageType: "localStorage",
                expires: EIGHT_HOURS
            });

        });

    });

    it("should destroy a session", function () {
        if (!CIAPI.store.isSpy)
            spyOn(CIAPI, "store");

        makeSuccessfulConnection();

        runs(function () {
            CIAPI.disconnect();
        });

        waitsFor(function () {
            return !CIAPI.connection.isConnected;
        });

        runs(function () {
            expect(CIAPI.store).toHaveBeenCalledWith({
                key: "CIAPI_connection",
                value: {
                    isConnected: false,
                    UserName: '',
                    Session: '',
                    ServiceUri: '',
                    StreamUri: ''
                },
                storageType: "localStorage",
                expires: EIGHT_HOURS
            });
        });

    });

    it("disconnect should publish a CIAPI.connection.status update message", function () {
        var publishedConnection, statusUpdateWasPublished = false;

        makeSuccessfulConnection();

        CIAPI.subscribe("CIAPI.connection.status", function (message) {
            statusUpdateWasPublished = true;
            publishedConnection = message;
        });

        runs(function () {
            CIAPI.disconnect();
        });

        waitsFor(function () {
            return statusUpdateWasPublished;
        });

        runs(function () {
            expect(publishedConnection.isConnected).toBeFalsy();
            expect(publishedConnection.UserName).toBe("");
        });

    });

    it("should replace Connection tokens in string", function () {
        makeSuccessfulConnection();

        runs(function () {
            expect(CIAPI.replaceConnectionTokens("UserName is {CIAPI.connection.UserName}")).toBe("UserName is CC735158");
            expect(CIAPI.replaceConnectionTokens("Session is {CIAPI.connection.Session}")).toBe("Session is {ef4923-mock-session-token-fe552}");
        });
    });
});

