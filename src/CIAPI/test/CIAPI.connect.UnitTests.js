describe("CIAPI.connect unit tests", function () {
    var EIGHT_HOURS = 8 * 60 * 60 * 1000; //in ms

    beforeEach(function () {
        CIAPI.connection.ServiceUri = "http://174.129.8.84/TradingApi";
        CIAPI.connection.StreamUri = "http://pushpreprod.cityindextest9.co.uk";
    });

    it("should create a session", function () {
        runs(function () {
            CIAPI.connect({
                UserName: "CC735158",
                Password: "password"
            });
        });

        waitsFor(function () {
            return CIAPI.connection.isConnected;
        });

        runs(function () {
            expect(CIAPI.connection.Session).toBeTruthy();
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

     it("connect should store the connection details in sessionStorage", function () {
        if (!CIAPI.store.isSpy) 
            spyOn(CIAPI, "store");

        runs(function () {
            CIAPI.connect({
                UserName: "CC735158",
                Password: "password"
            });
        });

        waitsFor(function () {
            return CIAPI.connection.isConnected;
        });

        runs(function () {
            expect(CIAPI.store).toHaveBeenCalledWith({
                key: "CIAPI_connection",
                value:  {
                    isConnected : true,
                    UserName : 'CC735158',
                    Session : '{ef4923-mock-session-token-fe552}',
                    ServiceUri : 'http://174.129.8.84/TradingApi',
                    StreamUri : 'http://pushpreprod.cityindextest9.co.uk'
                },
                storageType: "sessionStorage",
                expires: EIGHT_HOURS
            });

        });

    });

    it("should destroy a session", function () {
        if (!CIAPI.store.isSpy) 
            spyOn(CIAPI, "store");

        runs(function () {
            var that = this;
            CIAPI.connect({
                UserName: "CC735158",
                Password: "password"
            });
        });

        waitsFor(function () {
            return CIAPI.connection.isConnected;
        });

        runs(function () {
            CIAPI.disconnect();
        });

        waitsFor(function () {
            return !CIAPI.connection.isConnected;
        });

        runs(function () {
            expect(CIAPI.store).toHaveBeenCalledWith({
                key: "CIAPI_connection",
                value:  {
                    isConnected : false,
                    UserName : '',
                    Session : '',
                    ServiceUri : 'http://174.129.8.84/TradingApi',
                    StreamUri : 'http://pushpreprod.cityindextest9.co.uk'
                },
                storageType: "sessionStorage",
                expires: EIGHT_HOURS
            });
        });

    });


});


