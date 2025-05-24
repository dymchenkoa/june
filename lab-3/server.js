const net = require("net");

const clients = new Map();

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (data) => {
    const commandId = data[0];

    if (commandId === 1) {
      console.log("Received ping");
      socket.write(Buffer.from([2]));
    } else if (commandId === 3) {
      const message = data.slice(1);
      console.log("Echoing:", message.toString());
      socket.write(message);
    } else if (commandId === 4) {
      const username = data.slice(1).toString();
      console.log("User logged in:", username);
      clients.set(socket, username);
      socket.write(Buffer.from([5]));
    } else if (commandId === 6) {
      const message = data.slice(1).toString();
      const sender = clients.get(socket) || "Anonymous";
      const fullMessage = `${sender}: ${message}`;
      console.log("Broadcasting:", fullMessage);

      const msgBuffer = Buffer.from(fullMessage, "utf-8");
      const response = Buffer.concat([Buffer.from([6]), msgBuffer]);

      for (const [client, _] of clients.entries()) {
        if (client !== socket) {
          client.write(response);
        }
      }
    } else if (commandId === 7) {
      const usernames = Array.from(clients.values()).join(", ");
      const listBytes = Buffer.from(usernames, "utf-8");
      const response = Buffer.concat([Buffer.from([8]), listBytes]);
      socket.write(response);
    } else {
      console.log("Unknown command:", data);
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
    clients.delete(socket);
  });

  socket.on("error", (err) => {
    console.log("Socket error:", err.message);
    clients.delete(socket);
  });
});

server.listen(3008, () => {
  console.log("Server running on port 3008");
});
