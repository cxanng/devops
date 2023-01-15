const amqp = require("amqplib");
const { writeLogLine } = require("../utils/writeLogLine");

module.exports.publish = async (amqp_url, topic, interval) => {
    const connection = await amqp.connect(amqp_url);
    const channel = await connection.createChannel();

    const exchange = "my_topic";

    await channel.assertExchange(exchange, "topic", { durable: false });

    const publishMsg = (msg) => channel.publish(exchange, topic, Buffer.from(msg));

    const recursivePublish = (stateObject) => {
        // State object includes:
        // - index: message index
        // - state: application state
        // - lastEmit: previous message emit time
        // - remain: the remaining milliseconds from the last emit
        // - taskId: timeout ID of the next task
        // - stateChangeLog: state change log
        // console.log("Before run")
        // console.log({ ...stateObject, taskId: ""});
        const handleMsg = () => {
            publishMsg(`MSG_${stateObject.index}`);
            stateObject.index += 1;
            stateObject.lastEmit = new Date();
        };

        if (stateObject.state === "RUNNING") {
            stateObject.taskId = setTimeout(() => {
                handleMsg();
                // console.log("In running");
                // console.log(stateObject);
                stateObject.taskId = setTimeout(() => recursivePublish(stateObject), interval);
            }, Math.max(stateObject.remain, 0));
        }

        if (stateObject.state === "INIT") {
            stateObject.state = "RUNNING";
            stateObject.stateChangeLog = writeLogLine(stateObject.state, stateObject.stateChangeLog);
            recursivePublish(stateObject);
            return;
        }
        // console.log("Done running");
    };
    return recursivePublish;
};