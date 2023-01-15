const { sendGetRequest, sendPutRequest, checkConnection, delayInMs } = require("../../utils");

const API_GATEWAY_BASE_URL = "http://localhost:8083";
const WAIT_AFTER_REQUEST = 1000;

module.exports.integrationTests = () => {
    // Set up for integration test
    beforeAll(async () => {
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
        await delayInMs(WAIT_AFTER_REQUEST);
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "PAUSED");
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
        await delayInMs(WAIT_AFTER_REQUEST);
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "PAUSED");
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "RUNNING");
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "PAUSED");
        await delayInMs(WAIT_AFTER_REQUEST);
    });

    it("The server should be running", async () => {
        const response = await checkConnection(API_GATEWAY_BASE_URL, "/message");
        expect(response).toBe(true);
    }, 10000);

    it("GET /run-log to check all services works properly", async () => {
        const response = await sendGetRequest(API_GATEWAY_BASE_URL, "/run-log");
        const logLines = response.split("\n").slice(-11);
        // The last 10 log lines should contains the previously states sent to the system
        // After each "INIT", there will be a "RUNNING" created automatically
        expect(logLines[0]).toContain("INIT");
        expect(logLines[1]).toContain("RUNNING");
        expect(logLines[2]).toContain("PAUSED");
        expect(logLines[3]).toContain("INIT");
        expect(logLines[4]).toContain("RUNNING");
        expect(logLines[5]).toContain("PAUSED");
        expect(logLines[6]).toContain("RUNNING");
        expect(logLines[7]).toContain("INIT");
        expect(logLines[8]).toContain("RUNNING");
        expect(logLines[9]).toContain("PAUSED");
    });

    it("PUT /shutdown should stop all services", async () => {
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "SHUTDOWN");
        const stateResponse = await sendGetRequest(API_GATEWAY_BASE_URL, "/state");
        const logResponse = await sendGetRequest(API_GATEWAY_BASE_URL, "/run-log");
        expect(stateResponse).toBeFalsy();
        expect(logResponse).toBeFalsy();
    });
};