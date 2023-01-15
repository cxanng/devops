const { createProxyMiddleware } = require("http-proxy-middleware");

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

const HTTPSERV_URL = process.env.HTTPSERV_URL || "http://httpserv:8081";
const ORIG_URL = process.env.ORIG_URL || "http://orig:8000";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "http://guest:guest@rabbitmq:15672/api";
const RABBITMQ_SHUTDOWN_URL = process.env.RABBITMQ_SHUTDOWN_URL || "http://rabbitmq:8888/shutdown";

const STATE_ENUM = ["INIT", "RUNNING", "PAUSED", "SHUTDOWN"];

app.get("/", (req, res) => {
    const content = fs.readFileSync("./api_doc.txt");
    res.send(content).status(200).end();
});

app.get("/state", createProxyMiddleware({
    target: ORIG_URL
}));

app.get("/run-log", createProxyMiddleware({
    target: ORIG_URL
}));

app.get("/messages", createProxyMiddleware({
    target: HTTPSERV_URL,
    pathRewrite: {
        "^/messages": ""
    }
}));

app.put("/state", async (req, res) => {
    if (typeof req.body !== "string") {
        res.status(500).end();
    } else {
        const state = req.body.toUpperCase();
        if (!STATE_ENUM.includes(state)) {
            res.status(400).end();
        }
        await axios.put(`${ORIG_URL}/state/${state}`);

        if (state === "SHUTDOWN") {
            await axios.get(`${HTTPSERV_URL}/shutdown`);
            await axios.get(RABBITMQ_SHUTDOWN_URL);
            res.status(202).send(state).end();
            process.exit(0);
        } else {
            res.status(202).send(state).end();
        }
    }
});

app.get("/node-statistic", (req, res) => {
    axios.get(`${RABBITMQ_URL}/overview/`)
    .then(response => response.data.object_totals)
    .then(dataObj => res.send(dataObj).status(200).end())
    .catch(() => res.sendStatus(500));
});

app.get("/queue-statistic", (req, res) => {
    axios.get(`${RABBITMQ_URL}/queues/`)
    .then(response => response.data.map(queue => ({
        message_delivery_rate: queue.message_stats.deliver_get_details.rate,
        message_publishing_rate: queue.message_stats.publish_details.rate,
        messages_delivered_recently: queue.message_stats.deliver_get,
        messages_published_lately: queue.message_stats.publish,
    })))
    .then(data => res.send(data).status(200).end())
    .catch(() => res.sendStatus(500));
});

app.listen(8083, () => {
    // eslint-disable-next-line
    console.log("API gateway is running on port 8083");
});
