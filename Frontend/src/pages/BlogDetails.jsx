import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  Calendar,
  User,
  ArrowLeft,
  Heart,
  Trash2,
  MessageCircle,
  Share2,
} from "lucide-react";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.log("Invalid user data");
      }
    }
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(`https://my-complete-blog-app.onrender.com/api/blogs/${id}`);
      setBlog(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://my-complete-blog-app.onrender.com/api/blogs/like/${id}`,
        {},
        { headers: { Authorization: token } },
      );
      setBlog({ ...blog, likes: res.data.likes });
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://my-complete-blog-app.onrender.com/api/blogs/comment/${id}`,
        { text: comment },
        { headers: { Authorization: token } },
      );
      setBlog({ ...blog, comments: res.data });
      setComment("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `https://my-complete-blog-app.onrender.com/api/blogs/comment/${id}/${commentId}`,
        { headers: { Authorization: token } },
      );
      setBlog({ ...blog, comments: res.data });
    } catch (error) {
      console.log(error);
    }
  };

  const isLiked = blog?.likes?.includes(user?._id);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading post...</p>
          </div>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Post not found
            </h1>
            <p className="text-gray-500 mb-6">
              The post you're looking for doesn't exist
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Main content */}
          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Cover Image */}
            {blog.blogimg && blog.blogimg.trim() !== "" && (
              <div className="relative h-64 sm:h-96 bg-gray-100">
                <img
                  src={blog.blogimg}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Title */}

              {/* Author info */}
              <div className="flex items-center justify-between flex-wrap gap-4 pb-6 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {blog.user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {blog.user?.name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Like button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isLiked
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  <span className="font-medium">{blog.likes?.length || 0}</span>
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Description */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {blog.description.split("\n").map((para, idx) => (
                  <p key={idx} className="mb-4">
                    {para}
                  </p>
                ))}
              </div>

              {/* Comments section */}
              <div className="mt-12 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Comments
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {blog.comments?.length || 0}
                  </span>
                </h2>

                {/* Add comment */}
                {user ? (
                  <div className="flex gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleComment}
                          disabled={!comment.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 text-center mb-8">
                    <p className="text-gray-600 mb-3">
                      Login to join the conversation
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Login to Comment
                    </button>
                  </div>
                )}

                {/* Comments list */}
                <div className="space-y-4">
                  {blog.comments?.length > 0 ? (
                    blog.comments.map((item) => (
                      <div key={item._id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
                          {item.user?.name?.charAt(0).toUpperCase() || "G"}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {item.user?.name || "Guest"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {item.text}
                          </p>
                          {item?.user?._id === user?._id && (
                            <button
                              onClick={() => handleDeleteComment(item._id)}
                              className="mt-2 text-red-500 hover:text-red-700 transition"
                              aria-label="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-400">No comments yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Be the first to share your thoughts
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default BlogDetails;
