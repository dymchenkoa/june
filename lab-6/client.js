const readline = require("readline");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:3000";
let currentUser = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function ping() {
  try {
    const response = await axios.get(`${API_URL}/ping`);
    console.log("Server response:", response.data.response);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function echo(text) {
  try {
    const response = await axios.post(`${API_URL}/echo`, { text });
    console.log("Server response:", response.data.response);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function login(username) {
  try {
    const response = await axios.post(`${API_URL}/login`, { username });
    console.log(response.data.message);
    currentUser = username;
  } catch (error) {
    console.error("Error:", error.response?.data?.error || error.message);
  }
}

async function logout() {
  if (!currentUser) {
    console.log("You are not logged in");
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: { "X-Username": currentUser },
      }
    );
    console.log(response.data.message);
    currentUser = null;
  } catch (error) {
    console.error("Error:", error.response?.data?.error || error.message);
  }
}

async function listUsers() {
  if (!currentUser) {
    console.log("You need to log in first");
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { "X-Username": currentUser },
    });
    console.log("Logged in users:", response.data.users.join(", "));
  } catch (error) {
    console.error("Error:", error.response?.data?.error || error.message);
  }
}

async function sendMessage(recipient, ...messageParts) {
  if (!currentUser) {
    console.log("You need to log in first");
    return;
  }

  const message = messageParts.join(" ");
  try {
    const response = await axios.post(
      `${API_URL}/message`,
      { to: recipient, text: message },
      {
        headers: { "X-Username": currentUser },
      }
    );
    console.log(response.data.message);
  } catch (error) {
    console.error("Error:", error.response?.data?.error || error.message);
  }
}

async function sendFile(recipient, filepath) {
  if (!currentUser) {
    console.log("You need to log in first");
    return;
  }

  try {
    const content = fs.readFileSync(filepath, "utf8");
    const filename = path.basename(filepath);

    const response = await axios.post(
      `${API_URL}/file`,
      {
        to: recipient,
        filename,
        content,
      },
      {
        headers: { "X-Username": currentUser },
      }
    );
    console.log(response.data.message);
  } catch (error) {
    console.error("Error:", error.response?.data?.error || error.message);
  }
}

async function checkUpdates() {
  if (!currentUser) {
    console.log("You need to log in first");
    return;
  }

  try {
    const messagesResponse = await axios.get(`${API_URL}/messages`, {
      headers: { "X-Username": currentUser },
    });

    if (messagesResponse.data.messages.length > 0) {
      console.log("\nNew messages:");
      messagesResponse.data.messages.forEach((msg) => {
        console.log(`From ${msg.from}: ${msg.text}`);
      });

      await axios.post(
        `${API_URL}/message`,
        { to: currentUser, text: "" },
        {
          headers: { "X-Username": currentUser },
        }
      );
    }

    const filesResponse = await axios.get(`${API_URL}/files`, {
      headers: { "X-Username": currentUser },
    });

    if (filesResponse.data.files.length > 0) {
      console.log("\nReceived files:");
      filesResponse.data.files.forEach((file) => {
        console.log(`From ${file.from}: ${file.filename}`);
        fs.writeFileSync(file.filename, file.content);
        console.log(`File saved as ${file.filename}`);
      });

      await axios.post(
        `${API_URL}/file`,
        { to: currentUser, filename: "", content: "" },
        {
          headers: { "X-Username": currentUser },
        }
      );
    }

    if (
      messagesResponse.data.messages.length === 0 &&
      filesResponse.data.files.length === 0
    ) {
      console.log("No new messages or files");
    }
  } catch (error) {
    console.error("Error:", error.response?.data?.error || error.message);
  }
}

function processCommand(input) {
  const [command, ...args] = input.trim().split(" ");

  switch (command.toLowerCase()) {
    case "ping":
      ping();
      break;
    case "echo":
      echo(args.join(" "));
      break;
    case "login":
      if (args.length < 1) {
        console.log("Usage: login <username>");
        break;
      }
      login(args[0]);
      break;
    case "logout":
      logout();
      break;
    case "users":
      listUsers();
      break;
    case "msg":
      if (args.length < 2) {
        console.log("Usage: msg <recipient> <message>");
        break;
      }
      sendMessage(args[0], ...args.slice(1));
      break;
    case "file":
      if (args.length < 2) {
        console.log("Usage: file <recipient> <filepath>");
        break;
      }
      sendFile(args[0], args[1]);
      break;
    case "check":
      checkUpdates();
      break;
    case "exit":
      if (currentUser) {
        logout().then(() => process.exit(0));
      } else {
        process.exit(0);
      }
      break;
    default:
      console.log('Unknown command. Type "help" for available commands.');
  }
}

rl.on("line", (input) => {
  processCommand(input);
  if (input.trim().toLowerCase() !== "exit") {
    rl.prompt();
  }
});

rl.on("close", () => {
  if (currentUser) {
    logout().then(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

rl.prompt();
