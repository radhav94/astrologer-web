import { Suspense, useState } from "react";
import { Icons } from "../components/Icons";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : "Unknown";

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* LEFT: Profile + Info */}
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Icons.Menu size={22} />
              </button>

              {/* Avatar */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                      <img
                        src="https://picsum.photos/100/100"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 ${
                        isOnline ? "bg-green-500" : "bg-gray-300"
                      } border-2 border-white rounded-full`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Name + Date */}
              <div className="leading-tight  text-start">
                <p className="text-xs  text-gray-500">Namaste</p>
                <p className="text-sm font-semibold text-gray-900">
                  {userName}
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* RIGHT: Followers + Status */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs text-gray-500">1.15k followers</p>

              <div className="flex justify-start lg:justify-end">
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className={`relative flex items-center h-9 w-[92px] rounded-full px-1 transition-colors duration-300 ${
                    isOnline ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute text-xs font-semibold text-white left-3 transition-opacity ${
                      isOnline ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Online
                  </span>

                  <span
                    className={`absolute text-xs font-semibold text-white right-3 transition-opacity ${
                      !isOnline ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    Offline
                  </span>

                  <span
                    className={`h-7 w-7 bg-white rounded-full shadow transform transition-transform duration-300 ${
                      isOnline ? "translate-x-[52px]" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        <Suspense fallback="..Loading">
          <div className="p-4  max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
            <Outlet />
          </div>
        </Suspense>

        {/* Bottom padding for mobile nav if needed */}
        <div className="h-1"></div>
      </main>
    </div>
  );
};

export default HomeLayout;
