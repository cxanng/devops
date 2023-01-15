
const { observe } = require("./rabbitmq-service/observe");
const fs = require("fs");

const AMQP_URL = process.env.AMQP_URL || "amqp://rabitmq:5672";
const TOPIC = "#";
const PATH = "./db/log.txt";

const logLine = (msg, idx) => {
    const timeStamp = new Date();
    return `${timeStamp.toISOString()} ${idx} ${msg.content.toString()} to ${msg.fields.routingKey}\n`;
};

const writeLogWithCount = (msg, count) => {
    fs.appendFileSync(PATH, logLine(msg, count.value));
    count.value += 1;
};

// Clear previous content of the file if the service is restart
// eslint-disable-next-line
try {
    fs.writeFileSync(PATH, "");
} catch (err) {
    throw err;
}

observe(AMQP_URL, TOPIC, writeLogWithCount);
