import express from "express";
import fs from "fs";
import https from "https";
import path from "path";

import bcrypt from "bcryptjs";

import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";

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

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Private chat app backend is running");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ mesg: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ msg: "User registration successfull" });
  } catch (error) {
    res.status(500).json({ msg: "server error", error });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalida credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: "server error", error });
  }
});

const _dirname = path.resolve();
const options = {
  key: fs.readFileSync(path.join(_dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join("cert", "cert.pem")),
};

https.createServer(options, app).listen(3000, () => {
  console.log("Server is runing on port 3000");
});
