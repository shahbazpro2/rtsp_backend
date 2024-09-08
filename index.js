// server.js
const express = require("express");
const http = require("http");
const { Rabbitmq } = require("./Rabbitmq");
const { queues } = require("./constant");
const cors = require("cors");
const Stream = require("node-rtsp-stream");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const stream = new Stream({
  name: "Bunny",
  streamUrl: "rtsp://admin:zxcvbnm0.@190.92.4.249:554/cam/realmonitor?channel=1&subtype=0",
  wsPort: 6789,
  /*  ffmpegOptions: {
      "-f": "mpegts",
      "-codec:v": "mpeg1video",
      "-b:v": "1000k",
      "-stats": "",
      "-r": 25,
      "-s": "1920x1080",
      "-bf": 0,
      "-codec:a": "mp2",
      "-ar": 44100,
      "-ac": 1,
      "-b:a": "128k",
    }, */
});

const port = 8000;

let currentQueueData = {
  [queues[0]]: {},
  [queues[1]]: {},
};
// Serve static files from the 'public' directory
app.use(express.static("public"));

// Handle a Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected");

  Rabbitmq(currentQueueData, io);

  // Handle a custom event
  socket.on("clientMessage", (data) => {
    console.log("Received message:", data);
    // Broadcast the data to all connected clients
    io.emit("serverMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
