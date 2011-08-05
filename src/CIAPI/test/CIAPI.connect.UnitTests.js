describe("CIAPI.connect unit tests", function () {
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
//
//    it("should destroy a session (including cookies)", function () {
//        runs(function () {
//            var that = this;
//            CIAPI.connect({
//                UserName: "CC735158",
//                Password: "password"
//            });
//        });
//
//        waitsFor(function () {
//            return CIAPI.connection.isConnected;
//        });
//
//        runs(function () {
//            expect(document.cookie).toContain("UserName=CC735158");
//            expect(document.cookie + ';').toContain("Session=%7Bef4923-mock-session-token-fe552%7D");
//            CIAPI.disconnect();
//        });
//
//        waitsFor(function () {
//            return !CIAPI.connection.isConnected;
//        });
//
//        runs(function () {
//            expect(document.cookie).toMatch("(UserName=?;|UserName=$)");
//            expect(document.cookie + ';').toMatch("Session=?;");
//
//            expect(CIAPI.connection.UserName).toBeFalsy();
//            expect(CIAPI.connection.Session).toBeFalsy();
//        });
//
//    });
//
//    it("connect should store the session and username", function () {
//        spyOn(CIAPI, "store");
//
//        runs(function () {
//            CIAPI.connect({
//                UserName: "CC735158",
//                Password: "password"
//            });
//        });
//
//        waitsFor(function () {
//            return CIAPI.connection.isConnected;
//        });
//
//        runs(function () {
//            expect(CIAPI.store).toHaveBeenCalled();
//            expect(CIAPI.store.mostRecentCall.args[1].UserName).toBe("CC735158");
//            expect(CIAPI.store.mostRecentCall.args[1].Session).toBeTruthy();
//        });
//
//    });
});


