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
let currentQueueData = {
  [queues[0]]: {},
  [queues[1]]: {},
};
let stream, singleStream;

app.get("/stream", (req, res) => {
  const stream1 = () => {
    stream = new Stream({
      name: "Bunny",
      streamUrl: "rtsp://127.0.0.1:8554/ds-test",
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
  };
  if (stream) {
    stream.stop();
  }
  stream1();
  res.send({ message: "success" });
});

app.get("/stream/:id", (req, res) => {
  const parms = req.params.id;
  const cameraData = currentQueueData[queues[0]]?.[parms];
  if (!cameraData) {
    res.send({ message: "Camera not found" });
  }
  const stream1 = () => {
    singleStream = new Stream({
      name: "Single Camera",
      streamUrl: cameraData,
      wsPort: 6790,
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
  };
  if (stream) {
    singleStream.stop();
  }
  stream1();
  res.send({ message: "success" });
});

const port = 8000;

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Handle a Socket.IO connection
io.on("connection", (socket) => {
  console.log("New client connected", currentQueueData[queues[0]]);

  socket.on("initialData", () => {
    io.emit(queues[0], currentQueueData[queues[0]]);
    io.emit(queues[1], currentQueueData[queues[1]]);
  });

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
