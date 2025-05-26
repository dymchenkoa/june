const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let users = [];
let messages = {};
let files = {};

const authenticate = (req, res, next) => {
  const username = req.headers["x-username"];
  if (!username || !users.includes(username)) {
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
    return res.status(400).json({ error: "Username is required" });
  }
  if (users.includes(username)) {
    return res.status(400).json({ error: "User already logged in" });
  }
  users.push(username);
  messages[username] = [];
  files[username] = [];
  console.log(`${username} logged in`);
  res.json({ message: "Login successful" });
});

app.post("/logout", authenticate, (req, res) => {
  const username = req.headers["x-username"];
  users = users.filter((u) => u !== username);
  console.log(`${username} logged out`);
  res.json({ message: "Logout successful" });
});

app.get("/users", authenticate, (req, res) => {
  res.json({ users });
});

app.post("/message", authenticate, (req, res) => {
  const { to, text } = req.body;
  const from = req.headers["x-username"];

  if (!users.includes(to)) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  messages[to].push({ from, text });
  res.json({ message: "Message sent" });
});

app.get("/messages", authenticate, (req, res) => {
  const username = req.headers["x-username"];
  res.json({ messages: messages[username] });
});

app.post("/file", authenticate, (req, res) => {
  const { to, filename, content } = req.body;
  const from = req.headers["x-username"];

  if (!users.includes(to)) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  files[to].push({ from, filename, content });
  res.json({ message: "File sent" });
});

app.get("/files", authenticate, (req, res) => {
  const username = req.headers["x-username"];
  res.json({ files: files[username] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
