console.log("Hello world");

// Bonus
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: ">> ",
});

console.log("Console Interpreter Started (type 'exit' to quit)");
rl.prompt();

rl.on("line", (line) => {
  const input = line.trim();
  const parts = input.split(" ");
  const command = parts[0];
  const params = parts.slice(1);

  if (command === "exit") {
    console.log("Exiting interpreter.");
    rl.close();
    return;
  }

  console.log(
    `Entered command = "${command}", parameters = ${JSON.stringify(params)}`
  );
  rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});
