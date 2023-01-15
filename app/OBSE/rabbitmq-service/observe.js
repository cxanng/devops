const amqp = require("amqplib");

module.exports.observe = async (amqp_url, topic, callback) => {
    const connection = await amqp.connect(amqp_url);
    const channel = await connection.createChannel();

    const exchange = "my_topic";
    await channel.assertExchange(exchange, "topic", { durable: false });

    const queue = await channel.assertQueue("", {
        exclusive: true
    });

    const count = {
        value: 1
    };

    channel.bindQueue(queue.queue, exchange, topic);
    channel.consume(queue.queue, (msg) => callback(msg, count), {
        noAck: true
    });

    return () => connection.close();
};
