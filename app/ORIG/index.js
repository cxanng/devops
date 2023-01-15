const { publish } = require("./rabbitmq-service/publish");
const { writeLogLine } = require("./utils/writeLogLine");

const AMQP_URL = process.env.AMQP_URL || "amqp://rabitmq:5672";
const TOPIC = "compse140.o";
const INTERVAL = 3000;

const STATE_ENUM = ["INIT", "RUNNING", "PAUSED", "SHUTDOWN"];

let stateObject = {
    state: "INIT",
    index: 1,
    lastEmit: null,
    remain: 0,
    taskId: null,
    stateChangeLog: writeLogLine("INIT", ""),
};

const recursivePublish = publish(AMQP_URL, TOPIC, INTERVAL, stateObject);

const express = require("express");
const app = express();

app.get("/state", (req, res) => {
    res.status(200).send(stateObject.state).end();
});

app.put("/state/:newState", async (req, res) => {
    const newState = req.params.newState;

    if (!STATE_ENUM.includes(newState)) {
        return res.status(400).end();
    }

    const publishCallback = await recursivePublish;

    // Handle state change
    if (newState === "INIT") {
        // Clear previous timer id to reset the timer
        clearTimeout(stateObject.taskId);
        // Reset the state object except the state log
        stateObject = {
            ...stateObject,
            state: "INIT",
            index: 1,
            lastEmit: null,
            remain: 0,
            taskId: null,
            stateChangeLog: writeLogLine(newState, stateObject.stateChangeLog)
        };
        publishCallback(stateObject);
        return res.status(202).end();
    }

    if (newState === "SHUTDOWN") {
        res.status(202).end();
        return process.exit(0);
    }

    if (newState === stateObject.state) {
        return res.status(202).end();
    } else {
        if (newState === "PAUSED") {
            // Stop the current timer
            clearTimeout(stateObject.taskId);
            // Recalculate the remaining time from the stopped interval to add to the next run
            stateObject = {
                ...stateObject,
                state: "PAUSED",
                remain: INTERVAL - (new Date() - stateObject.lastEmit),
                stateChangeLog: writeLogLine(newState, stateObject.stateChangeLog)
            };
            // stateObject.stateChangeLog = writeLogLine(newState, stateObject.stateChangeLog);
            return res.status(202).end();
        }
        if (newState === "RUNNING") {
            stateObject = {
                ...stateObject,
                state: "RUNNING",
                stateChangeLog: writeLogLine(newState, stateObject.stateChangeLog)
            };
            // console.log(stateObject);
            publishCallback(stateObject);
            return res.status(202).end();
        }
    }
    return res.status(202).end();
});

app.get("/run-log", (req, res) => {
    res.send(stateObject.stateChangeLog).status(200).end();
});

app.listen(8000, () => {
    // eslint-disable-next-line
    console.log("ORIG running on port 8000");
});

// Wait 5 seconds for all services to bind queues to the message queue
setTimeout(() => recursivePublish.then(callback => callback(stateObject)), 5000);
