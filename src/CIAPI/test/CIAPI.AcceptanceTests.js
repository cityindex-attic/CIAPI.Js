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
        var isConnected = CIAPI.connect({
                                UserName: "CC735158",
                                Password: "password",
                                ServiceUri: "http://174.129.8.69/TradingApiOnly200",
                                StreamUri: "http://pushpreprod.cityindextest9.co.uk",
                                onError: function() {
                                    console.log('a connection error occurred');
                                }
                            });
        expect(isConnected).toBeTruthy();
    });
});


