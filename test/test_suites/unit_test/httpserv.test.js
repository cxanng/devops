const { sendGetRequest, sendPutRequest, delayInMs } = require("../../utils");

const API_GATEWAY_BASE_URL = "http://localhost:8083";
const BASE_URL = "http://localhost:8081";

module.exports.httpservTest = () => {
    beforeAll(async () => {
        await sendPutRequest(API_GATEWAY_BASE_URL, "/state", "INIT");
    });
    it("Should return file content", async () => {
        const response = await sendGetRequest(BASE_URL, "");
        await delayInMs(6000);
        expect(response).toMatch(/1 MSG_1 to compse140.o/);
    }, 10000);
};
