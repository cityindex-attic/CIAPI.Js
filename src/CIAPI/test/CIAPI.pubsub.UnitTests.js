describe("CIAPI.pubsub unit tests", function () {
    beforeEach(function () {
    });

    it("should be able to publish and receive a message", function () {
        CIAPI.subscribe("MOCK.TOPIC", function (message) {
            expect(message.messageData).toBe("Hello world");
        });

        CIAPI.publish("MOCK.TOPIC", { messageData: "Hello world" });
    });

    it("any request error should be published to CIAPI.request.error", function () {

        var messageRecieved = false, that = this;

        CIAPI.subscribe("CIAPI.request.error", function (message) {
            messageRecieved = message;
        });

        runs(function () {
            amplify.request({
                resourceId: "apiError",
                errorResponse: new CIAPI.dto.ApiErrorResponseDTO(401, 4010, "Error message details"),
            });
        });

        waitsFor(function () {
            return messageRecieved;
        });

        runs(function () {
            console.log(messageRecieved, "was published to CIAPI.request.error");
            expect(messageRecieved.HttpStatus).toEqual(401);
        });
    });

});
