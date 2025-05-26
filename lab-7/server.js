const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let users = new Set();
let messages = {};
let files = {};
let awayUsers = new Set();
let lastActivity = {};

const authenticate = (req, res, next) => {
  const username = req.headers["x-username"];
  if (!username || !users.has(username)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

app.get("/ping", (req, res) => {
  res.json({ response: "pong" });
});

app.post("/echo", (req, res) => {
  res.json({ response: req.body.text });
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username and password required" });
  }
  if (users.has(username)) {
    return res.status(400).json({ error: "User already logged in" });
  }
  users.add(username);
  messages[username] = [];
  files[username] = [];
  lastActivity[username] = Date.now();
  console.log(`${username} logged in`);
  res.json({ message: "Login successful" });
});

app.post("/logout", authenticate, (req, res) => {
  const username = req.headers["x-username"];
  users.delete(username);
  awayUsers.delete(username);
  delete lastActivity[username];
  console.log(`${username} logged out`);
  res.json({ message: "Logout successful" });
});

app.get("/users", authenticate, (req, res) => {
  res.json({ users: Array.from(users) });
});

app.post("/message", authenticate, (req, res) => {
  const { to, text } = req.body;
  const from = req.headers["x-username"];

  if (!users.has(to)) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  lastActivity[from] = Date.now();
  awayUsers.delete(from);

  const recipientInactive = Date.now() - lastActivity[to] > 5 * 60 * 1000;
  if (recipientInactive && !awayUsers.has(to)) {
    awayUsers.add(to);
    console.log(`${to} is now away`);
  }

  if (awayUsers.has(to)) {
    messages[from].push({
      from: "system",
      text: `${to} is away. Your message: "${text}"`,
    });
    return res.json({ message: "Recipient is away" });
  }

  messages[to].push({ from, text });
  res.json({ message: "Message sent" });
});

app.get("/messages", authenticate, (req, res) => {
  const username = req.headers["x-username"];
  res.json({ messages: messages[username] });
  messages[username] = [];
});

app.post("/file", authenticate, (req, res) => {
  const { to, filename, content } = req.body;
  const from = req.headers["x-username"];

  if (!users.has(to)) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  lastActivity[from] = Date.now();
  awayUsers.delete(from);

  files[to].push({ from, filename, content });
  res.json({ message: "File sent" });
});

app.get("/files", authenticate, (req, res) => {
  const username = req.headers["x-username"];
  res.json({ files: files[username] });
  files[username] = [];
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
