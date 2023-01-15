const request = require("supertest");
const sendGetRequest = async (baseUrl, endpoint) => {
    try {
        const response = await request(baseUrl).get(endpoint);
        return response.text;
    } catch (err) {
        return false;
    }
};

const sendGetJSONRequest = async (baseUrl, endpoint) => {
    try {
        const response = await request(baseUrl).get(endpoint);
        return response.body;
    } catch (err) {
        return false;
    }
};

const sendPutRequest = async (baseUrl, endpoint, payload) => {
    try {
        const response = await request(baseUrl).put(endpoint).send(payload).set("Content-Type", "text/plain");
        return response.text;
    } catch (err) {
        return false;
    }
};

const checkConnection = async (baseUrl, endPoint) => {
    const retries = 10;
    let attempts = 1;
    while (attempts < retries) {
        const response = await sendGetRequest(baseUrl, endPoint);
        if (response) {
            return true;
        } else {
            delayInMs(1000);
            attempts += 1;
        }
    }
    return false;
};

const msgCount = (data) => {
    try {
        const regexp = /MSG_/g;
        const msgs = Array.from(data.matchAll(regexp), m => m[0]);
        return msgs.length;
    } catch (err) {
        return 0;
    }
};

// eslint-disable-next-line
const delayInMs = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
    sendGetRequest,
    sendPutRequest,
    delayInMs,
    checkConnection,
    msgCount,
    sendGetJSONRequest
};