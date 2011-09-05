describe("CIAPI widget globalization", function () {
    it("localize messages should translate strings", function () {
        $.widget.addCultureInfo("en-GB", {
            messages: {
                "logon": "Log On"
            }
        });

        $.widget.addCultureInfo("pl-PL", {
            messages: {
                "logon": "Zaloguj się"
            }
        });

        $.widget.culture('en-GB');
        expect($.widget.localize("logon")).toBe("Log On");

        $.widget.culture('pl-PL');
        expect($.widget.localize("logon")).toBe("Zaloguj się");
    });

    it("format should set and get the current culture correctly", function () {
        $.widget.culture('en-GB');
        expect($.widget.getCurrentCulture()).toBe("en-GB");

        $.widget.culture('pl-PL');
        expect($.widget.getCurrentCulture()).toBe("pl-PL");

    });

    it("format should format dates correctly", function () {
        $.widget.culture('en-GB');
        expect($.widget.format(new Date(1955, 10, 5), "yyyy/MM/dd")).toBe("1955/11/05");
        expect($.widget.format(new Date(1955, 10, 5), "dddd MMMM d, yyyy")).toBe("Saturday November 5, 1955");

        $.widget.culture('pl-PL');
        expect($.widget.format(new Date(1955, 10, 5), "yyyy/MM/dd")).toBe("1955-11-05");
        expect($.widget.format(new Date(1955, 10, 5), "dddd MMMM d, yyyy")).toBe("sobota listopada 5, 1955");

    });

    it("format should format numbers correctly", function () {
        $.widget.culture('en-GB'); 
        expect($.widget.format(1234.567, "n")).toBe("1,234.57");
        expect($.widget.format(1234.567, "n1")).toBe("1,234.6");
        expect($.widget.format(1234.567, "n0")).toBe("1,235");

        $.widget.culture('pl-PL');
        expect($.widget.format(1234.567, "n")).toBe("1 234,57");
        expect($.widget.format(1234.567, "n1")).toBe("1 234,6");
        expect($.widget.format(1234.567, "n0")).toBe("1 235");

        $.widget.culture('de-DE');
        expect($.widget.format(1234.567, "n")).toBe("1.234,57");
        expect($.widget.format(1234.567, "n1")).toBe("1.234,6");
        expect($.widget.format(1234.567, "n0")).toBe("1.235");

    });

    it("parseDate should parse local dates", function () {
        $.widget.culture('en-GB');
        expect($.widget.parseDate("1/2/2003")).toEqual(new Date(2003, 1, 1)); // dd/mm/yyyy - Jan 02 2003

        $.widget.culture('en-US');
        expect($.widget.parseDate("1/2/2003")).toEqual(new Date(2003, 0, 2)); // mm/dd/yyyy - Feb 01 2003
    });

    it("parseInt should parse local ints ", function () {
        $.widget.culture('en-GB');
        expect($.widget.parseInt("1,234")).toEqual(1234);

        $.widget.culture('pl-PL');
        expect($.widget.parseInt("1 234")).toEqual(1234);
    });

    it("parseFloat should parse local floats", function () {
        $.widget.culture('en-GB');
        expect($.widget.parseFloat("1,234.57")).toEqual(1234.57);

        $.widget.culture('pl-PL');
        expect($.widget.parseFloat("1 234,57")).toEqual(1234.57);
    });

});


