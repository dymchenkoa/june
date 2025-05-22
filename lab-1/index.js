// use "cd lab-1" then use "node index.js" in the terminal

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function countFactorial(n) {
  let result = 1;

  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function countUserAge(bhd) {
  const [day, month, year] = bhd.split(".").map(Number);

  const birthDate = new Date(year, month - 1, day);
  const currentDate = new Date();

  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  const timeDiff = currentDate.getTime() - birthDate.getTime();
  const daysLived = Math.floor(timeDiff / (1000 * 3600 * 24));

  return `${age} year (${daysLived} days) old.`;
}

const isValidDateInput = (str) => {
  const [d, m, y] = str.split(".").map(Number);

  const date = new Date(y, m - 1, d);

  let isFutureDate = date > new Date();

  return (
    /^\d{2}\.\d{2}\.\d{4}$/.test(str) &&
    date.getDate() === d &&
    date.getMonth() === m - 1 &&
    date.getFullYear() === y &&
    !isFutureDate
  );
};

console.log("HELLo World!");

rl.question("Please, enter your name: ", (name) => {
  console.log(`Hello, ${name}.`);

  const nameLength = name.length;

  console.log(
    `Your name has ${nameLength} letters. ${nameLength}! = ${countFactorial(
      nameLength
    )}`
  );

  rl.question(
    "Please, enter your birth date in format (DD.MM.YYYY): ",
    (bhd) => {
      if (!isValidDateInput(bhd)) {
        console.log("Invalid birth date entry.");
        rl.close();
        return;
      }

      console.log(
        `Today is ${new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date())}, you are ${countUserAge(bhd)}`
      );

      rl.close();
    }
  );
});
