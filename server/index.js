const express = require("express");
const cors = require("cors");
require('dotenv').config();
const { app, server } = require('./socket/index');
const router = require("./routes/index");
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const path = require("path");

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 8080;
const ROOT_DIR = path.resolve(__dirname, '..');

app.use("/api", router);

if (process.env.NODE_ENV === 'production') {
  console.log("✅ Running in PRODUCTION mode");

  app.use(express.static(path.join(ROOT_DIR, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'client', 'build', 'index.html'));
  });

} else {
  console.log("🚧 Running in DEVELOPMENT mode");

  app.get('/', (req, res) => {
    res.json({ message: "Server running at PORT " + PORT });
  });
}

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server is running at PORT " + PORT);
  });
});
