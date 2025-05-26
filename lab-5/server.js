const soap = require("soap");
const http = require("http");

const users = new Set();
const messages = [];

const service = {
  ChatService: {
    ChatServicePort: {
      ping: (args, callback) => {
        console.log("Ping received");
        callback({ message: "Pong" });
      },

      echo: (args, callback) => {
        console.log("Echo received:", args.text);
        callback({ message: `You said: ${args.text}` });
      },

      login: (args, callback) => {
        const username = args.username;
        if (users.has(username)) {
          callback({ message: `Username ${username} is already taken` });
        } else {
          users.add(username);
          console.log(`${username} logged in`);
          messages.push({
            sender: "System",
            recipient: "all",
            message: `${username} has joined the chat`,
          });
          callback({ message: `Welcome, ${username}!` });
        }
      },

      listUsers: (args, callback) => {
        callback({ users: Array.from(users).join(",") });
      },

      sendMessage: (args, callback) => {
        if (!users.has(args.sender)) {
          callback({ message: "You need to login first" });
          return;
        }
        if (!users.has(args.recipient) && args.recipient !== "all") {
          callback({ message: `User ${args.recipient} not found` });
          return;
        }

        messages.push({
          sender: args.sender,
          recipient: args.recipient,
          message: args.message,
        });

        console.log(
          `Message from ${args.sender} to ${args.recipient}: ${args.message}`
        );
        callback({ message: "Message sent successfully" });
      },

      sendFile: (args, callback) => {
        if (!users.has(args.sender)) {
          callback({ message: "You need to login first" });
          return;
        }
        if (!users.has(args.recipient)) {
          callback({ message: `User ${args.recipient} not found` });
          return;
        }

        messages.push({
          sender: args.sender,
          recipient: args.recipient,
          message: `File ${args.fileName} sent`,
          file: {
            name: args.fileName,
            content: args.fileContent,
          },
        });

        console.log(
          `File ${args.fileName} sent from ${args.sender} to ${args.recipient}`
        );
        callback({ message: "File sent successfully" });
      },

      checkMessages: (args, callback) => {
        if (!users.has(args.username)) {
          callback({ messages: [] });
          return;
        }

        const userMessages = messages.filter(
          (msg) => msg.recipient === args.username || msg.recipient === "all"
        );

        callback({ messages: userMessages });
      },
    },
  },
};

const server = http.createServer((request, response) => {
  response.end("404: Not Found: " + request.url);
});

const wsdlPath = "./service.wsdl";

soap.listen(server, "/service", service, wsdlPath, () => {
  console.log("SOAP server running at http://localhost:8000/service?wsdl");
});

server.listen(8000);
