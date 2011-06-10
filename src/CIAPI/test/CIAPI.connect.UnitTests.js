describe("CIAPI.connect unit tests", function() {
    beforeEach(function() {

    });

    it("should create a session", function(){
        runs(function(){
            CIAPI.connect({
                UserName: "CC735158",
                Password: "password",
                ServiceUri: "http://174.129.8.69/TradingApi",
                StreamUri: "http://pushpreprod.cityindextest9.co.uk"
            });
        });

        waitsFor(function() {
            return CIAPI.connection.isConnected;
        });

        runs(function() {
            console.log(CIAPI.connection);
            expect(CIAPI.connection.Session).toBeTruthy();
        });

    });

    it("should report an error for an invalid login", function(){

        runs(function(){
            var that = this;
            CIAPI.connect({
                UserName: "invalid",
                Password: "invalid",
                ServiceUri: "http://174.129.8.69/TradingApi",
                StreamUri: "http://pushpreprod.cityindextest9.co.uk",
                error: function(data) {
                    console.log(data);
                    that.responseRecieved = true;
                    that.error = data;
                }
            });
        });

        waitsFor(function() {
            return this.responseRecieved;
        });

        runs(function() {
            console.log(CIAPI.connection);
            expect(this.error.HttpStatus).toBe(401);
            expect(CIAPI.connection.Session).toBeFalsy();
        });

    });


});


