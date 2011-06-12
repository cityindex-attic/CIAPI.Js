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

});


