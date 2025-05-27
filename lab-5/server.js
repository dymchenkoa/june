// const http = require("http");
// const soap = require("soap");
// const fs = require("fs");

// const wsdlXml = fs.readFileSync("./service.wsdl", "utf8");

// const service = {
//   ChatService: {
//     ChatServicePort: {
//       ping: function (_, callback) {
//         callback({ message: "Pong from server" });
//       },
//       echo: function (args, callback) {
//         console.log("Echo", args.text);
//         callback({ message: `Echo: ${args.text}` });
//       },
//     },
//   },
// };

// const server = http.createServer((req, res) => {
//   res.statusCode = 404;
//   res.end("404" + req.url);
// });

// soap.listen(server, "/service", service, wsdlXml);
// server.listen(8000, () => {
//   console.log("Server running at http://localhost:8000/service?wsdl");
// });

const http = require("http");
const soap = require("soap");
const fs = require("fs");

const wsdlXml = fs.readFileSync("./service.wsdl", "utf8");

const users = new Set();

const service = {
  ChatService: {
    ChatServicePort: {
      ping: (_, cb) => cb({ message: "Pong from server" }),
      echo: (args, cb) => cb({ message: `Echo: ${args.text}` }),
      login: (args, cb) => {
        const { username } = args;
        if (users.has(username)) {
          cb({ message: `User ${username} already logged in.` });
        } else {
          users.add(username);
          cb({ message: `Welcome, ${username}` });
        }
      },
    },
  },
};

const server = http.createServer((req, res) => {
  res.statusCode = 404;
  res.end("404" + req.url);
});

soap.listen(server, "/service", service, wsdlXml);
server.listen(8000, () => {
  console.log("Server running at http://localhost:8000/service?wsdl");
});
