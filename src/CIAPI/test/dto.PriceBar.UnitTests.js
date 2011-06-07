describe("PriceBar dto unit tests", function() {
    var date, priceBar;

    beforeEach(function() {
        date = new Date();
        priceBar = new CIAPI.dtos.PriceBarDTO(date, 1, 2, 0, 1.5);
    });

    it("should have readonly properties", function() {
        expect(priceBar.BarDate).toEqual(date);

        //Trying to set a property should do nothing
        priceBar.BarDate = "foobar";
        expect(priceBar.BarDate).toEqual(date);

        priceBar.Close = -1;
        console.log(priceBar);
        expect(priceBar.Close).toEqual(1.5);
    });

    it("should serialise to JSON correctly", function() {
        var expectedJSON = '{"BarDate":'+JSON.stringify(date)+',"Open":1,"High":2,"Low":0,"Close":1.5}';
        expect(JSON.stringify(priceBar)).toEqual(expectedJSON);
    });

});


