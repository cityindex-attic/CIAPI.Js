describe("CIAPI.store unit tests", function () {
    var theValue = { a: "A", number: 1234 };

    beforeEach(function () {
       _(['sessionStorage','localStorage']).each(function(storageType) {
           CIAPI.store({key:"testKey", value: "DELETED", storageType:storageType });
       })
    });

    it("should save & read from localStorage if available", function () {

        //Ignore this test if localStorage isn't available
        try {
            if ( window.localStorage.getItem ) {
                //do nothing
            }
        } catch( e ) {
            return;
        }

        //Test saving
        CIAPI.store({
            key: "testKey",
            value: theValue
        });

        expect(JSON.parse(window.localStorage.getItem('__amplify__testKey')).data).toEqual(theValue);

        //Test reading
        var readValue = CIAPI.store({
            key: "testKey",
            storageType: "localStorage"
        });

        expect(readValue).toEqual(theValue);

    });
});


