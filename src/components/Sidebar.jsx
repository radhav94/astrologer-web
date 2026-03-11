import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Icons } from "./Icons";
import { useCall } from "../context/CallContext";
import { Toast } from "../components";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { kundliId } = useParams();
  const { setAstroId } = useCall(); // 🔥 VERY IMPORTANT

  const handleLogout = () => {
    // localStorage.removeItem("shubhtalk_role");
    // localStorage.removeItem("shubhtalk_astro_id");
    // localStorage.removeItem("shubhtalk_astro_token");
    // localStorage.removeItem("shubhtalk_astrologer_details");
    // localStorage.removeItem("accessToken");
    localStorage.clear();
    sessionStorage.removeItem("otpSession");
    // navigate("/");
    Toast.success("You have been logged out successfully.");

    setAstroId(null);

    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      icon: Icons.Home,
      label: "Dashboard",
      id: "dashboard",
      path: "/dashboard",
    },
    {
      icon: Icons.Calendar,
      label: "Order History",
      id: "history",
      path: "/consultation-history",
    },
    {
      icon: Icons.Chats,
      label: "Chats",
      id: "chats",
      path: "/chats",
    },
    // {
    //   icon: Icons.Wallet,
    //   label: "Recent Activity",
    //   id: "activity",
    //   path: "/recent-activity",
    // },
    { icon: Icons.User, label: "Profile", id: "profile", path: "/profile" },
    {
      icon: Icons.Radio,
      label: "Live",
      id: "live",
      path: "/live-preview",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }
        `}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r border-gray-100
        ${isOpen ? "translate-x-0" : "-translate-x-full"} ${kundliId ? "hidden" : "block"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-gray-800">ShubhAstro</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <Icons.X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              onClick={onClose}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? "bg-green-50 text-green-600 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500  hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Icons.LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
