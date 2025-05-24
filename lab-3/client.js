const net = require("net");
const readline = require("readline/promises");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let currentUsername = "";

const client = net.createConnection({ port: 3008 }, () => {
  console.log("Connected to server");
});

let resolveResponse;
let responsePromise = new Promise((resolve) => (resolveResponse = resolve));

client.on("data", (data) => {
  const commandId = data[0];

  if (data.length === 1 && commandId === 2) {
    console.log("pong");
  } else if (data.length === 1 && commandId === 5) {
    console.log("Login acknowledged");
  } else if (commandId === 6) {
    console.log("Message:", data.slice(1).toString());
  } else if (commandId === 8) {
    const users = data.slice(1).toString().split(",");
    console.log("Online users:");
    users.forEach((u) => {
      const name = u.trim();
      const label = name === currentUsername ? " [you]" : "";
      console.log(` - ${name}${label}`);
    });
  } else {
    console.log("Server:", data.toString());
  }

  resolveResponse();
  responsePromise = new Promise((resolve) => (resolveResponse = resolve));
});

client.on("end", () => {
  console.log("Disconnected from server");
  rl.close();
});

client.on("connect", async () => {
  while (true) {
    const input = await rl.question(
      "Enter a command (ping, echo <text>, login <name>, msg <text>, list, exit): "
    );

    if (input === "exit") {
      client.end();
      rl.close();
      break;
    }

    const [cmd, ...rest] = input.split(" ");

    if (cmd === "ping") {
      client.write(Buffer.from([1]));
    } else if (cmd === "echo") {
      const message = rest.join(" ");
      const msgBytes = Buffer.from(message, "utf-8");
      const buffer = Buffer.concat([Buffer.from([3]), msgBytes]);
      client.write(buffer);
    } else if (cmd === "login") {
      const username = rest.join(" ");
      currentUsername = username;
      const nameBytes = Buffer.from(username, "utf-8");
      const buffer = Buffer.concat([Buffer.from([4]), nameBytes]);
      client.write(buffer);
    } else if (cmd === "msg") {
      const message = rest.join(" ");
      const msgBytes = Buffer.from(message, "utf-8");
      const buffer = Buffer.concat([Buffer.from([6]), msgBytes]);
      client.write(buffer);
      continue;
    } else if (cmd === "list") {
      client.write(Buffer.from([7]));
    } else {
      console.log("Unknown command.");
      continue;
    }

    await responsePromise;
  }
});
