describe("CIAPI services unit tests", function() {

    it("should return all the GBP markets", function() {
        runs(function(){
            var that = this;
            CIAPI.services.ListCfdMarkets({
                            NameStartsWith: "GBP",
                            success: function(data) {
                                 that.responseRecieved = true;
                                 that.markets = data.Markets;
                            }
                     });
        });

        waitsFor(function() {
            return this.responseRecieved;
        }, 100);

        runs(function() {
            expect(this.markets.length).toEqual(1);
        });


    });

    it("should return the right number of PriceBars", function() {
        runs(function(){
            var that = this;
            CIAPI.services.GetPriceBars({
                            MarketId: 400509815,
                            MaxResults: 15,
                            success: function(priceBars) {
                                 that.responseRecieved = true;
                                 that.bars = priceBars;
                            }
                     });
        });

        waitsFor(function() {
            return this.responseRecieved;
        }, 100);

        runs(function() {
            expect(this.bars.length).toEqual(15);
        });


    });


});


