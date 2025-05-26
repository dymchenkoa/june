const net = require("net");

let clients = new Map();

const server = net.createServer((socket) => {
  console.log("Client connected");
  let username = null;

  socket.on("data", (data) => {
    const message = data.toString().trim();
    const [cmd, ...args] = message.split(" ");

    switch (cmd) {
      case "ping":
        socket.write("pong\n");
        break;

      case "echo":
        socket.write(args.join(" ") + "\n");
        break;

      case "exit":
        socket.end("Goodbye!\n");
        break;

      case "login":
        username = args[0];
        if (!username) {
          socket.write("Username is required.\n");
          return;
        }
        clients.set(username, socket);
        broadcast(`${username} logged in\n`, socket);
        break;

      case "list":
        if (!username) return socket.write("You must login first.\n");
        socket.write(`Users: ${[...clients.keys()].join(", ")}\n`);
        break;

      case "msg":
        if (!username) return socket.write("You must login first.\n");
        const [recipient, ...text] = args;
        const target = clients.get(recipient);
        if (target) {
          target.write(`${username}: ${text.join(" ")}\n`);
          socket.write(`Message sent to ${recipient}\n`);
        } else {
          socket.write("User not found.\n");
        }
        break;

      case "file":
        if (!username) return socket.write("You must login first.\n");
        const [user, filename, ...fileContent] = args;
        const recipientSocket = clients.get(user);
        if (recipientSocket) {
          recipientSocket.write(
            `File from ${username}: ${filename}\n${fileContent.join(" ")}\n`
          );
          socket.write(`File "${filename}" sent to ${user}\n`);
        } else {
          socket.write("User not found.\n");
        }
        break;

      default:
        socket.write("Unknown command\n");
    }
  });

  socket.on("end", () => {
    if (username) {
      clients.delete(username);
      broadcast(`${username} disconnected`);
    }
  });
});

function broadcast(msg, excludeSocket) {
  for (const [_, socket] of clients) {
    if (socket !== excludeSocket) socket.write(`[Broadcast] ${msg}`);
  }
}

server.listen(3008, () => {
  console.log("Server listening on port 3008");
});
