import express from "express";
import fs from "fs";
import https from "https";
import path from "path";

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log("MongoDB connection error", err));

const app = express();

app.get("/", (req, res) => {
  res.send("Private chat app backend is running");
});

const _dirname = path.resolve();
const options = {
  key: fs.readFileSync(path.join(_dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join("cert", "cert.pem")),
};

https.createServer(options, app).listen(3000, () => {
  console.log("Server is runing on port 3000");
});
