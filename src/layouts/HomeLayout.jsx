import { Suspense, useState, useEffect } from "react";
import { Icons } from "../components/Icons";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
  updateAstrologerStatus,
} from "../../src/services/appServices/authservice";
import AudioVideoContainer from "../screens/private/call/AudioVideoContainer";
import IncomingChatModal from "../components/IncomingChatModal";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useChat as useChatContext } from "../context/chatContext";
import { PATH } from "../utils/routes/Paths";
import toast from "../components/toast";
import { useGetAstrologerByIdQuery } from "../redux/astrologer/astrologerApi";
import StickyReviewFooter from "../screens/private/chat/review/StickyReviewFooter";

const HomeLayout = () => {
  const {kundliId} = useParams();
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  const astrologerId = userData?._id || userData?.id;
  const { data: astrologerResponse } = useGetAstrologerByIdQuery(astrologerId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusState, setStatusState] = useState({
    call: { isOnline: false, loading: false },
    chat: { isOnline: false, loading: false }
  });

  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  const avatar = userData?.imageUrl;

  //Chat
  const {setActiveChat, setChatSeconds} = useChatContext();
  const navigate = useNavigate();

  const handleStatusToggle = async (type) => {
    const currentStatus = statusState[type].isOnline;
    const isLoading = statusState[type].loading;

    if (isLoading) return;

    const newStatus = !currentStatus;
    
    // Optimistic UI
    setStatusState(prev => ({
      ...prev,
      [type]: { isOnline: newStatus, loading: true }
    }));

    try {
      // Determine activeType based on both statuses
      let activeType = [];
      
      if (type === 'call') {
        if (newStatus) activeType.push('audio', 'video');
        if (statusState.chat.isOnline) activeType.push('chat');
      } else {
        if (statusState.call.isOnline) activeType.push('audio', 'video');
        if (newStatus) activeType.push('chat');
      }

      const status = activeType.length > 0 ? "online" : "offline";
      
      const response = await updateAstrologerStatus(status, activeType);

      if (!response?.data?.success) {
        // Revert if API fails
        setStatusState(prev => ({
          ...prev,
          [type]: { isOnline: !newStatus, loading: false }
        }));
      } else {
        const updatedUser = {
          ...userData,
          isActive: status,
          activeType: activeType,
        };

        localStorage.setItem(
          "shubhtalk_astrologer_details",
          JSON.stringify(updatedUser)
        );
        
        setStatusState(prev => ({
          ...prev,
          [type]: { isOnline: newStatus, loading: false }
        }));
      }
    } catch (error) {
      console.error(`${type} toggle error:`, error);
      setStatusState(prev => ({
        ...prev,
        [type]: { isOnline: !newStatus, loading: false }
      }));
    }
  };

  useEffect(() => {
    const syncAstrologerStatus = async () => {
      if (!astrologerId) return;

      try {
        setStatusState(prev => ({
          call: { ...prev.call, loading: true },
          chat: { ...prev.chat, loading: true }
        }));
        
        if (astrologerResponse?.success) {
          const apiUser = astrologerResponse.data;
          const activeType = apiUser?.isActiveType || apiUser?.activeType || [];

          // Backend = source of truth
          setStatusState({
            call: { 
              isOnline: activeType.includes('audio') || activeType.includes('video'), 
              loading: false 
            },
            chat: { 
              isOnline: activeType.includes('chat'), 
              loading: false 
            }
          });

          // Update localStorage with latest data
          localStorage.setItem(
            "shubhtalk_astrologer_details",
            JSON.stringify(apiUser)
          );
        }
      } catch (err) {
        console.error("Status sync failed");
        setStatusState(prev => ({
          call: { ...prev.call, loading: false },
          chat: { ...prev.chat, loading: false }
        }));
      }
    };

    syncAstrologerStatus();
  }, [astrologerId, astrologerResponse]);

  //Handle if chat accepted by user
      useEffect(() => {
      const handleChatUserAccepted = (data) => {
        console.log("useraccept list update", data);
        const {astrologerId, roomId, userId, user} = data
        const firstName = user?.firstName?.trim();
        const lastName = user?.lastName?.trim();
        
        // Capitalize first letter of each name
        const capitalizeFirstLetter = (str) => {
          if (!str) return '';
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        };
        
        const formattedFirstName = capitalizeFirstLetter(firstName);
        const formattedLastName = capitalizeFirstLetter(lastName);
        const customerName = formattedFirstName && formattedLastName 
          ? `${formattedFirstName} ${formattedLastName}` 
          : formattedFirstName || "Customer";
        setActiveChat({
              roomId: roomId,
              isUserSide: false,
              chaterName: customerName,
              chaterId : userId,
              remainingTime: Number(data?.remainingTime)
            });
        if(data?.remainingTime)
        setChatSeconds(Number(data?.remainingTime)*60)
        
            navigate(
                    PATH.privateRoutes.CHAT_WINDOW.path.replace(
                      ":chatId",
                      userId
                    ),
                    {
                      state: {
                        userId: userId,
                        astrologerId: astrologerId,
                        fullName: customerName,
                        roomId: roomId,
                        isUserSide: false,
                        kundliId:null
                      },
                    }
                  )
      };

      const handleChatEnd = () => {
        toast.warning("Chat has ended")
        setActiveChat(null);
      }

      voiceSocket.on("chat:accepted", handleChatUserAccepted);
    voiceSocket.on("chat:ended", handleChatEnd);

      return () => {

    voiceSocket.off("chat:accepted", handleChatUserAccepted);
    voiceSocket.off("chat:ended", handleChatEnd);
      }
  }, [])

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden" >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
      <header className={`sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 ${kundliId ? 'hidden' : 'block'}`}>
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
                        src={avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 ${
                        (statusState.call.isOnline || statusState.chat.isOnline) ? "bg-green-500" : "bg-gray-300"
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
            <div className="flex flex-col items-end gap-2">
              <p className="text-xs text-gray-400">1.15k followers</p>

              <div className="flex gap-2">
                {/* Call Button */}
                <button
                  disabled={statusState.call.loading}
                  onClick={() => handleStatusToggle('call')}
                  className={`relative flex items-center gap-2 h-10 pl-4 pr-2 rounded-full transition-all duration-300 shadow-sm
                   ${statusState.call.isOnline 
                     ? "bg-[#D4F1E8]" 
                     : "bg-gray-200"}
                   ${statusState.call.loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}
                 `}
                >
                  <span className={`text-sm font-semibold ${
                    statusState.call.isOnline ? "text-[#0D7C59]" : "text-gray-500"
                  }`}>
                    Call
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm ${
                    statusState.call.isOnline ? "bg-[#0D7C59]" : "bg-gray-400"
                  }`}>
                    <Icons.Phone size={18} className="text-white" strokeWidth={2.5} />
                  </div>
                </button>

                {/* Chat Button */}
                <button
                  disabled={statusState.chat.loading}
                  onClick={() => handleStatusToggle('chat')}
                  className={`relative flex items-center gap-2 h-10 pl-4 pr-2 rounded-full transition-all duration-300 shadow-sm
                   ${statusState.chat.isOnline 
                     ? "bg-[#D4F1E8]" 
                     : "bg-gray-200"}
                   ${statusState.chat.loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}
                 `}
                >
                  <span className={`text-sm font-semibold ${
                    statusState.chat.isOnline ? "text-[#0D7C59]" : "text-gray-500"
                  }`}>
                    Chat
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm ${
                    statusState.chat.isOnline ? "bg-[#0D7C59]" : "bg-gray-400"
                  }`}>
                    <Icons.MessageSquare size={18} className="text-white" strokeWidth={2.5} />
                  </div>
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
        <AudioVideoContainer />
        <IncomingChatModal />
        <StickyReviewFooter/>
      </main>
    </div>
  );
};

export default HomeLayout;
