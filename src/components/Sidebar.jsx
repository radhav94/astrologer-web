import { Link, useLocation } from "react-router";
import { Icons } from "./Icons";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
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
      icon: Icons.Wallet,
      label: "Recent Activity",
      id: "activity",
      path: "/recent-activity",
    },
    { icon: Icons.User, label: "Profile", id: "profile", path: "/profile" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none lg:border-r border-gray-100 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

        <nav className="px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
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
        </nav>

        {/* <div className="absolute bottom-8 left-0 w-full px-6">
          <div className="bg-gray-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <Icons.Star
                  size={18}
                  className="text-yellow-400"
                  fill="currentColor"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Pro Plan</p>
                <p className="text-xs text-gray-400">Valid until Dec 2025</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;
