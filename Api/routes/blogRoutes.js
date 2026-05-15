import express from "express";

import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";
import {
  createBlog,
  getMyBlogs,
  getAllBlogs,
  DeleteBlogs,
} from "../controllers/Blog.js";

const router = express.Router();

router.post("/create", auth, upload.single("blogimg"), createBlog);

router.get("/me", auth, getMyBlogs);

router.get("/getblogs", auth, getAllBlogs);

router.delete("/deleteblogs/:id", auth, DeleteBlogs);

export default router;
