const soap = require("soap");
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SERVICE_URL = "http://localhost:8000/service?wsdl";

let soapClient = null;
let currentUser = null;
let messageCheckInterval = null;

async function connectToService() {
  try {
    soapClient = await soap.createClientAsync(SERVICE_URL);
    console.log("Connected to SOAP service");
    return true;
  } catch (error) {
    console.error("Failed to connect to SOAP service:", error.message);
    return false;
  }
}

function startMessageChecker() {
  if (messageCheckInterval) clearInterval(messageCheckInterval);

  messageCheckInterval = setInterval(async () => {
    if (!soapClient || !currentUser) return;

    try {
      const result = await soapClient.checkMessagesAsync({
        username: currentUser,
      });
      const messages = result[0].messages;
      if (messages && messages.length > 0) {
        messages.forEach((msg) => {
          console.log(`\n[${msg.sender}]: ${msg.message}`);
          if (msg.file) {
            console.log(`File received: ${msg.file.name}`);
          }
        });
      }
    } catch (error) {
      console.error("Error checking messages:", error.message);
    }
  }, 3000);
}

async function ping() {
  if (!soapClient) {
    console.log("Not connected to server");
    return;
  }
  try {
    const result = await soapClient.pingAsync({});
    console.log("Server response:", result[0].message);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function echo(text) {
  if (!soapClient) {
    console.log("Not connected to server");
    return;
  }
  try {
    const result = await soapClient.echoAsync({ text });
    console.log("Server response:", result[0].message);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function login(username) {
  if (!soapClient) {
    console.log("Not connected to server");
    return;
  }
  try {
    const result = await soapClient.loginAsync({ username });
    if (result[0].message.includes("Welcome")) {
      currentUser = username;
      console.log("Login successful:", result[0].message);
      startMessageChecker();
    } else {
      console.log("Login failed:", result[0].message);
    }
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}

async function listUsers() {
  if (!soapClient) {
    console.log("Not connected to server");
    return;
  }
  if (!currentUser) {
    console.log("You need to login first");
    return;
  }
  try {
    const result = await soapClient.listUsersAsync({});
    console.log("Logged in users:", result[0].users.split(",").join(", "));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function sendMessage(recipient, message) {
  if (!soapClient) {
    console.log("Not connected to server");
    return;
  }
  if (!currentUser) {
    console.log("You need to login first");
    return;
  }
  try {
    const result = await soapClient.sendMessageAsync({
      sender: currentUser,
      recipient,
      message,
    });
    console.log("Message status:", result[0].message);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function sendFile(recipient, filePath) {
  if (!soapClient) {
    console.log("Not connected to server");
    return;
  }
  if (!currentUser) {
    console.log("You need to login first");
    return;
  }
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const result = await soapClient.sendFileAsync({
      sender: currentUser,
      recipient,
      fileName: filePath.split("/").pop().split("\\").pop(),
      fileContent,
    });
    console.log("File status:", result[0].message);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function main() {
  const connected = await connectToService();
  if (!connected) return;

  rl.on("line", async (input) => {
    const args = input.trim().split(" ");
    const command = args.shift().toLowerCase();

    try {
      switch (command) {
        case "ping":
          await ping();
          break;
        case "echo":
          await echo(args.join(" "));
          break;
        case "login":
          await login(args[0]);
          break;
        case "list":
          await listUsers();
          break;
        case "msg":
          await sendMessage(args[0], args.slice(1).join(" "));
          break;
        case "file":
          await sendFile(args[0], args[1]);
          break;
        case "exit":
        case "quit":
          console.log("Goodbye!");
          if (messageCheckInterval) clearInterval(messageCheckInterval);
          process.exit(0);
        default:
          console.log("Unknown command");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  });
}

main();
