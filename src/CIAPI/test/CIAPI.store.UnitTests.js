describe("CIAPI.store unit tests", function () {
    var theValue = { a: "A", number: 1234 };

    beforeEach(function () {
       _(['sessionStorage','localStorage']).each(function(storageType) {
           CIAPI.store({key:"testKey", value: "DELETED", storageType:storageType });
       })
    });

    it("should save & read from sessionStorage", function () {

        //Test saving
        CIAPI.store({
            key: "testKey",
            value: theValue,
            storageType: "sessionStorage"
        });

        expect(JSON.parse(window.sessionStorage.getItem('__amplify__testKey')).data).toEqual(theValue);

        //Test reading
        var readValue = CIAPI.store({
            key: "testKey",
            storageType: "sessionStorage"
        });

        expect(readValue).toEqual(theValue);

    });
    it("should save & read from localStorage", function () {

        //Test saving
        CIAPI.store({
            key: "testKey",
            value: theValue,
            storageType: "localStorage"
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


