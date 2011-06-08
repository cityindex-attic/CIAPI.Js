describe("CIAPI acceptance tests", function() {
    var oneMinute = 1000 * 60;
    var timeDifference = function (priceBar1, priceBar2) {
        var difference = Math.abs(priceBar1.BarDate.getTime() - priceBar2.BarDate.getTime());
//        console.log("Difference between", priceBar1, priceBar2, "is", difference);
        return difference;
    };

    it("should return a meaningful valid pricehistory result", function() {
        var priceBars = CIAPI.services.GetPriceBars(100, 'minute', 1, 200);

        expect(priceBars.PriceBars.length).toEqual(200);
        expect(timeDifference(priceBars.PartialPriceBar, priceBars.PriceBars[0])).toEqual(oneMinute);

        for (var i = 0; i < priceBars.PriceBars.length-1; i++) {
            expect(timeDifference(priceBars.PriceBars[i], priceBars.PriceBars[i + 1])).toEqual(oneMinute);
        }
    });

    it("should return a meaningful list of CFD markets", function() {
        var markets = CIAPI.services.ListCfdMarkets("all", 'all', 65);

        expect(markets.length).toEqual(65);
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

    xit("should report an error for an invalid login", function(){

        runs(function(){
            CIAPI.connect({
                UserName: "invalid",
                Password: "invalid",
                ServiceUri: "http://174.129.8.69/TradingApi",
                StreamUri: "http://pushpreprod.cityindextest9.co.uk",
                onError: function(data, errorCode) {
                    this.errorCode - errorCode;
                    this.error = data;
                }
            });
        });

        waitsFor(function() {
            return this.errorCode;
        });

        runs(function() {
            console.log(CIAPI.connection);
            expect(this.errorCode).toBe(403);
            expect(CIAPI.connection.Session).toBeFalsy();
        });

    });
});


