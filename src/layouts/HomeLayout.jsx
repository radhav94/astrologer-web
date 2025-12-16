import { Suspense, useState } from "react";
import { Icons } from "../components/Icons";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const HomeLayout = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [currentPage, setCurrentPage] = useState("dashboard");
  const [isOnline, setIsOnline] = useState(true);

  // const renderContent = () => {
  //   switch (currentPage) {
  //     case "dashboard":
  //       return <Dashboard />;
  //     case "history":
  //       return (
  //         <ConsultationHistory onBack={() => setCurrentPage("dashboard")} />
  //       );
  //     case "activity":
  //       return <RecentActivity onBack={() => setCurrentPage("dashboard")} />;
  //     case "profile":
  //       return <Profile onBack={() => setCurrentPage("dashboard")} />;
  //     default:
  //       return <Dashboard />;
  //   }
  // };
  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName = firstName && lastName ? `${firstName} ${lastName}` : "Unknown";

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Header - Only show full header on Dashboard, simplified on others usually, but keeping consistent for now except Profile */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Icons.Menu size={24} />
              </button>

              {/* Conditional Title based on page, or keep user profile on Dashboard */}
              {true ? (
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
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Namaste</p>
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                      {userName}
                    </h1>
                  </div>
                </div>
              ) : (
                <div className="text-xl font-medium text-red-500 uppercase tracking-wider">
                  ShubhAstro
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {true && (
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString("en-GB")}
                  </p>
                  <p className="text-xs text-gray-500">1.15k Followers</p>
                </div>
              )}
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative inline-flex h-8 w-[4.3rem] items-center rounded-full transition-colors duration-300 ${
                  isOnline ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-300 ease-in-out ${
                    isOnline ? "translate-x-11" : "translate-x-1"
                  }`}
                />
                <span
                  className={`absolute text-[10px] font-bold text-white ${
                    isOnline ? "left-2" : "right-2"
                  }`}
                >
                  {isOnline ? "Online" : "offline"}
                </span>
              </button>
            </div>
          </div>
        </header>

        <Suspense fallback="..Loading">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
            <Outlet />
          </div>
        </Suspense>

        {/* Bottom padding for mobile nav if needed */}
        <div className="h-20 lg:h-8"></div>
      </main>
    </div>
  );
};

export default HomeLayout;
