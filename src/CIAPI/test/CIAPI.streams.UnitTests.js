describe("CIAPI streams unit tests", function() {

    it("should be able to subscribe and unsubscribe from prices", function() {
        runs(function(){
            var that = this;
            CIAPI.streams.SubscribeToPrice({
                            MarketId: 400516270,
                            message: function(price) {
                                 console.log("recieved new price", price);
                                 that.pricesRecieved = that.pricesRecieved + 1 || 1;
                                 that.lastPrice = price;
                            }
                     });
        });

        waitsFor(function() {
            return this.pricesRecieved >= 1;
        }, 2000);

        runs(function() {
            expect(this.lastPrice).toBeTruthy();
        });

        runs(function() {
            CIAPI.streams.UnsubscribeFromPrice({
                        MarketId: 400516270
                    });
            this.lastPrice = "no_new_prices_should_be_recieved";
        });

        waits(2000);

        runs(function() {
            expect(this.lastPrice).toBe("no_new_prices_should_be_recieved");
        });
    });


});


