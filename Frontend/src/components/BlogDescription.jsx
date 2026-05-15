import { useState } from "react";

const BlogDescription = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`text-sm text-gray-700 mt-2 leading-relaxed transition-all duration-300 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {text}
      </p>

      {/* Toggle button */}
      {text?.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 text-sm mt-1 hover:underline font-medium"
        >
          {expanded ? "see less" : "see more"}
        </button>
      )}
    </div>
  );
};

export default BlogDescription;
