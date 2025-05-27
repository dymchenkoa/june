// const soap = require("soap");
// const readline = require("readline");

// const SERVICE_URL = "http://localhost:8000/service?wsdl";

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// let soapClient = null;

// async function connect() {
//   try {
//     soapClient = await soap.createClientAsync(SERVICE_URL);
//     console.log("Test", SERVICE_URL);
//     showPrompt();
//   } catch (err) {
//     console.error("Err", err.message);
//     process.exit(1);
//   }
// }

// const showPrompt = () => {
//   rl.question("> ", async (input) => {
//     const [command, ...args] = input.trim().split(" ");
//     switch (command.toLowerCase()) {
//       case "ping":
//         await ping();
//         break;
//       case "echo":
//         await echo(args.join(" "));
//         break;
//       case "exit":
//         rl.close();
//         process.exit(0);
//       default:
//         console.log("Invalid command. Use: ping, echo [text], exit");
//     }
//     showPrompt();
//   });
// };

// const ping = async () => {
//   try {
//     const result = await soapClient.pingAsync({});
//     console.log("Server:", result[0].message);
//   } catch (err) {
//     console.error("Ping error:", err.message);
//   }
// };

// const echo = async (text) => {
//   if (!text) {
//     console.log("Usage: echo [text]");
//     return;
//   }
//   try {
//     const result = await soapClient.echoAsync({ text });
//     console.log("Server:", result[0].message);
//   } catch (err) {
//     console.error("Echo error:", err.message);
//   }
// };

// connect();

const soap = require("soap");
const readline = require("readline");

const SERVICE_URL = "http://localhost:8000/service?wsdl";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let soapClient = null;
let currentUser = null;

async function connect() {
  try {
    soapClient = await soap.createClientAsync(SERVICE_URL);
    console.log("Connected to:", SERVICE_URL);
    showPrompt();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

const showPrompt = () => {
  rl.question("> ", async (input) => {
    const [command, ...args] = input.trim().split(" ");
    switch (command.toLowerCase()) {
      case "ping":
        await ping();
        break;
      case "echo":
        await echo(args.join(" "));
        break;
      case "login":
        await login(args[0]);
        break;
      case "exit":
        console.log("Exiting...");
        rl.close();
        process.exit(0);
      default:
        console.log("Commands: ping, echo [text], login [username], exit");
    }
    showPrompt();
  });
};

const ping = async () => {
  try {
    const res = await soapClient.pingAsync({});
    console.log("Server:", res[0].message);
  } catch (err) {
    console.error("Ping error:", err.message);
  }
};

const echo = async (text) => {
  if (!text) return console.log("Usage: echo [text]");
  try {
    const res = await soapClient.echoAsync({ text });
    console.log("Server:", res[0].message);
  } catch (err) {
    console.error("Echo error:", err.message);
  }
};

const login = async (username) => {
  if (!username) return console.log("Usage: login [username]");
  try {
    const res = await soapClient.loginAsync({ username });
    currentUser = username;
    console.log("Server:", res[0].message);
  } catch (err) {
    console.error("Login error:", err.message);
  }
};

connect();
