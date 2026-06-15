import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaHome,
  FaPlusCircle,
  FaRegListAlt,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.log("Error parsing user data");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // Dynamic nav items based on authentication
  const navItems = [
    {
      path: "/",
      icon: FaHome,
      label: "Home",
      activeColor: "text-blue-600",
      hoverColor: "hover:text-blue-500",
    },
  ];

  // Only show Create and My Posts for authenticated users
  if (isAuthenticated) {
    navItems.push(
      {
        path: "/create",
        icon: FaPlusCircle,
        label: "Create",
        activeColor: "text-green-600",
        hoverColor: "hover:text-green-500",
      },
      {
        path: "/myposts",
        icon: FaRegListAlt,
        label: "My Posts",
        activeColor: "text-purple-600",
        hoverColor: "hover:text-purple-500",
      },
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                SocialHub
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group
                      ${
                        isActive(item.path)
                          ? `${item.activeColor} bg-gray-50`
                          : `text-gray-600 ${item.hoverColor} hover:bg-gray-50`
                      }`}
                  >
                    <Icon
                      className={`text-xl transition-transform group-hover:scale-110 ${
                        isActive(item.path) ? item.activeColor : ""
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section - Profile & Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Desktop Profile/Auth Section */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    {/* Profile Link - Only when logged in */}
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {user?.profilepic ? (
                        <img
                          src={user.profilepic}
                          alt={user.name || "Profile"}
                          className="w-8 h-8 rounded-full object-cover border-2 border-blue-500 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.src =
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 hidden lg:block">
                        {user?.name?.split(" ")[0] || "Profile"}
                      </span>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
                    >
                      <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium hidden lg:block">
                        Logout
                      </span>
                    </button>
                  </>
                ) : (
                  /* Login Button - When not logged in */
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors group shadow-md hover:shadow-lg"
                  >
                    <FaSignInAlt className="text-lg group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Login</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="text-2xl text-gray-600" />
                ) : (
                  <FaBars className="text-2xl text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute top-16 left-0 right-0 bg-white shadow-xl z-50 md:hidden animate-slideDown">
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${
                          isActive(item.path)
                            ? `${item.activeColor} bg-gray-50 font-semibold`
                            : `text-gray-600 ${item.hoverColor}`
                        }`}
                    >
                      <Icon className="text-xl" />
                      <span className="text-base">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Mobile Profile/Auth Section */}
                <div className="border-t border-gray-100 pt-3 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <FaUser className="text-xl" />
                        <span className="text-base">Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="text-xl" />
                        <span className="text-base">Logout</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <FaSignInAlt className="text-xl" />
                      <span className="text-base font-semibold">Login</span>
                    </button>
                  )}
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16 md:h-20"></div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;
