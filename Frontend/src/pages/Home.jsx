import { useEffect, useState, useCallback, useRef, memo } from "react";
import axios from "axios";
import Header from "../components/Header";
import BlogDescription from "../components/BlogDescription";
import { useNavigate } from "react-router-dom";

// Default avatar generator using UI Avatars (generates image with initials)
const getDefaultAvatar = (name = "User") => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
};

// Alternative: DiceBear for more styled avatars (uncomment if preferred)
// const getDefaultAvatar = (name = "User", seed = "") => {
//   return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || name)}`;
// };

const TimeAgo = memo(({ createdAt }) => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(createdAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(formatTimeAgo(createdAt));
    }, 60000);
    return () => clearInterval(timer);
  }, [createdAt]);

  return <p className="text-gray-500 text-sm">{timeAgo}</p>;
});

function formatTimeAgo(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return created.toLocaleDateString();
}

const BlogSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="w-32 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="px-4 pb-3 space-y-2">
      <div className="w-3/4 h-5 bg-gray-200 rounded" />
      <div className="w-full h-3 bg-gray-200 rounded" />
      <div className="w-2/3 h-3 bg-gray-200 rounded" />
    </div>
    <div className="w-full h-48 bg-gray-200" />
    <div className="flex justify-between px-4 py-3">
      <div className="flex gap-4">
        <div className="w-16 h-3 bg-gray-200 rounded" />
        <div className="w-16 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// Memoized blog card
const BlogCard = memo(({ blog, onNavigate }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/blog/${blog._id}`);
  }, [navigate, blog._id]);

  // Handle profile picture with fallback
  const profilePic = blog.user?.profilePic
    ? blog.user.profilePic.replace(
        "/upload/",
        "/upload/w_100,h_100,c_fill,q_auto,f_auto/",
      )
    : getDefaultAvatar(blog.user?.name);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500 via-pink-500 to-orange-400 blur-[2px] opacity-80" />
            <img
              loading="lazy"
              src={profilePic}
              alt={blog.user?.name || "User"}
              className="relative w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg bg-gray-200"
              onError={(e) => {
                // Ultimate fallback if even the default avatar fails
                e.target.src = getDefaultAvatar("User");
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-[15px] tracking-wide">
              {blog.user?.name || "Anonymous"}
            </h3>
            <TimeAgo createdAt={blog.createdAt} />
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition">
          ⋯
        </button>
      </div>

      <div className="px-4 pb-3">
        <h2 className="text-[18px] font-semibold text-gray-900 leading-snug">
          {blog.title}
        </h2>
        <BlogDescription text={blog.description} />
      </div>

      {blog.blogimg && (
        <div className="border-t border-b border-gray-100">
          <img
            src={blog.blogimg.replace("/upload/", "/upload/w_800,q_auto,f_auto/")}
            className="w-full max-h-[420px] object-cover"
            alt={blog.title}
            loading="lazy"
          />
        </div>
      )}

      <div className="flex justify-between px-4 py-2 text-xs text-gray-500">
        <div className="flex gap-4">
          <button className="hover:text-blue-600 flex items-center gap-1 transition">
            <span>👍</span> Like
          </button>
          <button className="hover:text-blue-600 flex items-center gap-1 transition">
            <span>💬</span> Comment
          </button>
          <button className="hover:text-blue-600 flex items-center gap-1 transition">
            <span>🔁</span> Repost
          </button>
        </div>
        <button className="hover:text-gray-700 transition">🔖 Save</button>
      </div>
    </div>
  );
});

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const lastBlogRef = useRef(null);

  const CACHE_KEY = "blogs_cache";
  const CACHE_TIME = 5 * 60 * 1000;

  const fetchBlogs = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const token = localStorage.getItem("token");

    if (pageNum === 1 && !isRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) {
          setBlogs(data.blogs);
          setHasMore(data.hasMore);
          setLoading(false);
          setInitialLoad(false);
          fetchBlogs(1, true);
          return;
        }
      }
    }

    try {
      if (pageNum === 1) setLoading(true);
      setError(null);

      const res = await axios.get(
        `https://my-complete-blog-app.onrender.com/api/blogs/getblogs?page=${pageNum}&limit=10`,
        {
          headers: { Authorization: token },
          signal: abortControllerRef.current.signal,
        },
      );

      const newBlogs = res.data.blogs || [];
      const totalPages = res.data.totalPages || 1;

      setBlogs((prev) => (pageNum === 1 ? newBlogs : [...prev, ...newBlogs]));
      setHasMore(pageNum < totalPages);

      if (pageNum === 1) {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: { blogs: newBlogs, hasMore: pageNum < totalPages },
            timestamp: Date.now(),
          }),
        );
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Fetch error:", err);
      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Failed to load blogs. Pull to retry.",
      );
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBlogs]);

  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchBlogs(nextPage);
            return nextPage;
          });
        }
      },
      { rootMargin: "200px" },
    );

    if (lastBlogRef.current) {
      observer.observe(lastBlogRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, fetchBlogs]);

  const handleRetry = useCallback(() => {
    setPage(1);
    setBlogs([]);
    fetchBlogs(1, true);
  }, [fetchBlogs]);

  const handleRefresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    handleRetry();
  }, [handleRetry]);

  return (
    <>
      <Header />

      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-2xl mx-auto space-y-4 px-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Home • Feed</div>
            <button
              onClick={handleRefresh}
              className="text-sm text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
              disabled={loading}
            >
              {loading ? "⟳ Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {initialLoad ? (
            Array.from({ length: 3 }).map((_, i) => (
              <BlogSkeleton key={`skeleton-${i}`} />
            ))
          ) : blogs.length === 0 && !error ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl mb-2">📝</div>
              <p className="font-medium">No blogs available</p>
              <p className="text-sm mt-1">Be the first to write something!</p>
            </div>
          ) : (
            <>
              {blogs.map((blog, index) => (
                <div
                  key={blog._id}
                  ref={index === blogs.length - 1 ? lastBlogRef : null}
                >
                  <BlogCard blog={blog} onNavigate={navigate} />
                </div>
              ))}

              {loading && !initialLoad && (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}

              {!hasMore && blogs.length > 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  — You've reached the end —
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
