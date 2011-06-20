describe("CIAPI.pubsub unit tests", function () {
    beforeEach(function () {
    });

    it("should be able to publish and receive a message", function () {
         CIAPI.subscribe("MOCK.TOPIC", function(message) {
             expect(message.messageData).toBe("Hello world");
         });

         CIAPI.publish("MOCK.TOPIC", { messageData: "Hello world" } );
    });

});


