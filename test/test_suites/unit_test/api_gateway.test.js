const { sendGetRequest, sendPutRequest, delayInMs, checkConnection, msgCount, sendGetJSONRequest } = require("../../utils");

const API_GATEWAY_BASE_URL = "http://localhost:8083";
const WAIT_INTERVAL = 6000;
const WAIT_AFTER_REQUEST = 1000;

// Return true if the number of messages increase
const compareMsgCount = async () => {
    const response1 = await sendGetRequest(API_GATEWAY_BASE_URL, "/messages");
    const count1 = msgCount(response1);

    await delayInMs(6000);
    const response2 = await sendGetRequest(API_GATEWAY_BASE_URL, "/messages");
    const count2 = msgCount(response2);
    return count1 < count2;
};
module.exports.apiGatewayTests = () => {
    describe("The server is running", () => {
        it("The server should be running", async () => {
            const response = await checkConnection(API_GATEWAY_BASE_URL, "/message");
            expect(response).toBe(true);
        }, 10000);
    });

    describe("GET /messages", () => {
        it("should return messages", async () => {
            await delayInMs(WAIT_INTERVAL);
            const response = await sendGetRequest(API_GATEWAY_BASE_URL, "/messages");
            expect(response).toContain("1 MSG_1 to compse140.o");
        }, 10000);
    });

    describe("PUT /state", () => {
        it("INIT should start the services", async () => {
            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
            const compare = await compareMsgCount();
            expect(compare).toBeTruthy();
        }, 10000);

        it("PAUSED should pause the services", async () => {
            // Reset state to initial state
            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
            await delayInMs(WAIT_AFTER_REQUEST);
            // Send a PUT /state with "PAUSED" payload
            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "PAUSED");
            // Wait a while so that the messages log can stop recording since eventhough
            // ORIG stopped sending message, IMED can still send message shortly after
            await delayInMs(WAIT_INTERVAL);

            // Check the file content
            const compare = await compareMsgCount();
            expect(compare).toBeFalsy();
        }, 20000);

        it("RUNNING should restart the services", async () => {
            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "RUNNING");
            await delayInMs(WAIT_AFTER_REQUEST);

            const compare = await compareMsgCount();
            expect(compare).toBeTruthy();
        }, 20000);
    });

    describe("GET /state", () => {
        it("Should return the current state of the system", async () => {
            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
            await delayInMs(WAIT_AFTER_REQUEST);
            const state = await sendGetRequest(API_GATEWAY_BASE_URL, "/state");
            expect(state).toMatch("RUNNING");

            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "PAUSED");
            await delayInMs(WAIT_AFTER_REQUEST);
            const state2 = await sendGetRequest(API_GATEWAY_BASE_URL, "/state");
            expect(state2).toMatch("PAUSED");

            await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "RUNNING");
            await delayInMs(WAIT_AFTER_REQUEST);
            const state3 = await sendGetRequest(API_GATEWAY_BASE_URL, "/state");
            expect(state3).toMatch("RUNNING");
        }, 30000);
    });

    describe("GET /node-statistic", () => {
        it("Should return the defined statistics", async () => {
            const metrics = ["channels", "connections", "consumers", "exchanges", "queues"];
            const response = await sendGetJSONRequest(API_GATEWAY_BASE_URL, "/node-statistic");
            metrics.forEach(metric => {
                expect(Object.keys(response)).toContain(metric);
                expect(typeof response[metric]).toMatch("number");
            });
        }, 30000);
    });

    describe("GET /queue-statistic", () => {
        it("Should return the queue stats", async () => {
            const metrics = [
                "message_delivery_rate",
                "message_publishing_rate",
                "messages_delivered_recently",
                "messages_published_lately"
            ];

            const response = await sendGetJSONRequest(API_GATEWAY_BASE_URL, "/queue-statistic");
            response.forEach(queue => {
                metrics.forEach(metric => {
                    expect(Object.keys(queue)).toContain(metric);
                    expect(typeof queue[metric]).toMatch("number");
                });
            });
        }, 6000);
    });
};