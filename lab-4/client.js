const net = require("net");
const readline = require("readline/promises");
const fs = require("fs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = net.createConnection({ host: "localhost", port: 3008 }, () => {
  console.log("Connected to server");
});

client.on("data", (data) => {
  console.log("Server:", data.toString());
});

client.on("end", () => {
  console.log("Disconnected from server");
  rl.close();
});

async function startClient() {
  while (true) {
    const input = await rl.question("> ");
    const [cmd, ...args] = input.trim().split(" ");

    if (cmd === "exit") {
      client.write("exit");
      break;
    } else if (cmd === "file") {
      const [user, filename] = args;
      const fileContent = fs.readFileSync(filename);
      client.write(`file ${user} ${filename} ${fileContent}`);
    } else {
      client.write(`${cmd} ${args.join(" ")}`);
    }
  }
}

startClient();
