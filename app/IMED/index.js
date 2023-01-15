const { consumeAndPublish } = require("./rabbitmq-service/consumeAndPublish");

const AMQP_URL = process.env.AMQP_URL || "amqp://rabitmq:5672";
const SUB_TOPIC = "compse140.o";
const PUB_TOPIC = "compse140.i";
const interval = 1000;

consumeAndPublish(AMQP_URL, SUB_TOPIC, PUB_TOPIC, interval);