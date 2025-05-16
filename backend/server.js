const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const authUser = require("./middleware/authUser");
const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();

const cors = require("cors");

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public routes (no authentication)
app.use("/api", authRoutes); // login and register endpoints

// Protect all routes below this line
app.use(authUser);

// Protected routes
// Apply middleware only to protected routes
app.use("/api/blogs", authUser, blogRoutes);

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
