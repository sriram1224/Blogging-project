const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    images: [
      {
        type: String, // Optional: URLs to Cloudinary-hosted images
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
