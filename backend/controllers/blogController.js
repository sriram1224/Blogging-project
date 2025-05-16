const Blog = require("../models/blog");

exports.saveDraft = async (req, res) => {
  try {
    const { title, content, tags, images, _id } = req.body;

    let blog;
    if (_id) {
      // Update existing draft
      blog = await Blog.findOneAndUpdate(
        { _id, author: req.user.userId },
        { title, content, tags, images, status: "draft" },
        { new: true }
      );
    } else {
      // Create new draft
      blog = new Blog({
        title,
        content,
        tags,
        images,
        status: "draft",
        author: req.user.userId,
      });
      await blog.save();
    }

    res.json({ message: "Draft saved", blog });
  } catch (err) {
    res.status(500).json({ error: "Failed to save draft" });
  }
};

exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ imageUrl: req.file.path }); // Cloudinary URL
};

// Create a blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    const newBlog = new Blog({
      title,
      content,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(",") : [],
      status,
      images,
      author: req.user.userId,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Create blog error:", error); // ✅ Add this
    res.status(500).json({ error: "Error creating blog" });
  }
};

// Get all published blogs (for public)
// controllers/blogController.js

exports.getAllPublishedBlogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = parseInt(req.query.limit) || 10; // default limit 10

  const skip = (page - 1) * limit;

  try {
    const totalBlogs = await Blog.countDocuments({ status: "published" });
    const blogs = await Blog.find({ status: "published" })
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
      blogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Get blogs by current logged-in user
exports.getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.userId });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user blogs" });
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILES:", req.files);
  console.log("USER:", req.user);

  try {
    const blogId = req.params.id;
    const { title, content, tags, status } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];

    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: blogId, author: req.user.userId },
      {
        $set: {
          title,
          content,
          tags: tags || [],
          status,
        },
        $push: { images: { $each: images } },
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ error: "Blog not found or unauthorized" });
    }

    res.json(updatedBlog);
  } catch (error) {
    console.error("Update Blog Error:", error); // Add this
    res.status(500).json({ error: "Failed to update blog" });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found or unauthorized" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
};
