const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const blogController = require("../controllers/blogController");
const authUser = require("../middleware/authUser");

// Public Routes
router.get("/", blogController.getAllPublishedBlogs);

// Protected Routes
router.post(
  "/upload",
  authUser,
  upload.single("image"),
  blogController.uploadImage
);
router.post("/save-draft", authUser, blogController.saveDraft);
router.post("/", authUser, upload.array("images"), blogController.createBlog);
router.get("/my-blogs", authUser, blogController.getUserBlogs);
router.put("/:id", authUser, upload.array("images"), blogController.updateBlog);

router.delete("/:id", authUser, blogController.deleteBlog);

module.exports = router;
