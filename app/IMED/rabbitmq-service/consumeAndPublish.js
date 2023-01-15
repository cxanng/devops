const amqp = require("amqplib");

module.exports.consumeAndPublish = async (amqp_url, sub_topic, pub_topic, interval) => {
    const connection = await amqp.connect(amqp_url);
    const channel = await connection.createChannel();

    const exchange = "my_topic";

    await channel.assertExchange(exchange, "topic", { durable: false });

    const publishMsg = (msg) => channel.publish(exchange, pub_topic, Buffer.from(msg));

    const queue = await channel.assertQueue("", {
        exclusive: true
    });

    channel.bindQueue(queue.queue, exchange, sub_topic);
    channel.consume(queue.queue, (msg) => {
        setTimeout(() => publishMsg(`Got ${msg.content.toString()}`), interval);
    }, { noAck: false });

    return () => connection.close();
};