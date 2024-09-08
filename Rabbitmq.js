const amqp = require("amqplib");
const { queues } = require("./constant");

const [queue1, queue2] = queues;

const queueFetch = async (channel, socket, currentQueueData, queue) => {
  try {
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        //console.log("Received message:", messageContent);
        currentQueueData[queue] = messageContent;
        socket.emit(queue, messageContent);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("Error receiving message:", err);
  }
};

async function Rabbitmq(currentQueueData, socket) {
  try {
    console.log("reached");
    /*     const connection = await amqp.connect("amqp://NVR:NVR@localhost:5672"); */
    /* socket.emit("NVR-Alert", { "Camera 14": false, "camera x": false, "Camera 15": true, "Camera 16": false, "Camera 5": false, "Camera 9": false, "Camera 11": false, "Camera 12": false });
    socket.emit("Camera-Status", {
      "Camera 5": "rtsp://admin:12345678k@10.10.10.220",
      "Camera 9": "rtsp://admin:12345678k@10.10.10.221",
      "Camera 11": "rtsp://admin:12345678k@10.10.10.221",
      "Camera 12": "rtsp://admin:12345678k@10.10.10.239",
      "Camera 14": "rtsp://admin:12345678k@10.10.10.235",
      "camera x": "rtsp://admin:12345678k@10.10.10.235:554/Streaming/Channels/102",
      "Camera 15": "rtsp://admin:12345678k@10.10.10.219",
      "Camera 16": "rtsp://admin:$$$DoNotEnter$$$@10.10.10.241",
    }); */
    const connection = await amqp.connect("amqp://127.0.0.1:5672");
    const channel = await connection.createChannel();
    socket.emit(queue1, currentQueueData[queue1]);
    socket.emit(queue2, currentQueueData[queue2]);
    queueFetch(channel, socket, currentQueueData, queue1);
    queueFetch(channel, socket, currentQueueData, queue2);

    /*  console.log("Waiting for messages in", queue); */
  } catch (error) {
    console.error(error);
  }

  return null;
}

module.exports = { Rabbitmq };
