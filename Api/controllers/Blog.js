import { Blog } from "../Models/Blog.js";
import cloudinary from "../config/cloudinary.js";

//create blogs

export const createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userid = req.user.id;
    let imageUrl = "";
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "mern_blog_images",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(req.file.buffer);
      });

      imageUrl = result.secure_url;
    }

    const newBlog = await Blog.create({
      title,
      description,
      blogimg: imageUrl,
      user: userid,
    });
    res.json({ message: "Blog created successfully", newBlog });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//get blog by id

export const getMyBlogs = async (req, res) => {
  try {
    const id = req.user.id;
    const blogs = await Blog.find({ user: id });
    if (blogs.length === 0) return res.json({ message: "Blog not found!" });
    res.json({ message: "blogs fetched successfully", blogs });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//get all blogs

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user");
    if (blogs.length === 0) return res.json({ message: "Blog not found!" });
    res.json({ message: "all blogs fetched successfully", blogs });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete blog

export const DeleteBlogs = async (req, res) => {
  const id = req.params.id;
  const deletedBlog = await Blog.findOneAndDelete({
    _id: id,
    user: req.user.id,
  });
  if (!deletedBlog) {
    return res.json({ message: "this blog does not exist" });
  }
  res.json({ message: "blog deleted successfully", deletedBlog });
};
