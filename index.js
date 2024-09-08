// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { Rabbitmq } = require("./Rabbitmq");
const { queues } = require("./constant");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

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

  Rabbitmq(currentQueueData, socket);

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
