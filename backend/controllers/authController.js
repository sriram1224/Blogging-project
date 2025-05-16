const bcrypt = require("bcrypt");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

const generateToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, {
    expiresIn: "7d",
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const usernameExists = await user.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({ username, email, password: hashedPassword });
    await newUser.save();
    const token = generateToken(newUser._id);
    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    console.log("Loaded SECRET_KEY:", process.env.SECRET_KEY);

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = generateToken(existingUser._id);
    res.status(200).json({ message: "User logged in successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = { register, login };
