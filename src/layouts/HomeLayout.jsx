import { Suspense, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Icons } from "../components/Icons";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { updateAstrologerStatus } from "../../src/services/appServices/authservice";
import AudioVideoContainer from "../screens/private/call/AudioVideoContainer";
import IncomingChatModal from "../components/IncomingChatModal";
import { voiceSocket } from "../services/appServices/voiceSocketServices";
import { useChat as useChatContext } from "../context/chatContext";
import { PATH } from "../utils/routes/Paths";
import toast from "../components/toast";
import { useGetAstrologerByIdQuery } from "../redux/astrologer/astrologerApi";
import StickyReviewFooter from "../screens/private/chat/review/StickyReviewFooter";
import { AppDefaultImg } from "../utils/appImages";
import { setAstrologerDetails } from "../reducer/registerSlice";
import { getDefaultImgBasedOnGender } from "../utils/utils";
import styles from "./HomeLayout.module.scss";
import StickyChatFooter from "../components/StickyChatFooter";
import MiniLiveBar from "../components/livestream/MiniLiveBar";

const HomeLayout = () => {
  const { kundliId } = useParams();
  const dispatch = useDispatch();

  // Get astrologer details from Redux state
  const astrologerDetails = useSelector(
    (state) => state.register.astrologerDetails,
  );
  const astrologerIdFromRedux = useSelector(
    (state) => state.register.astrologerId,
  );

  // Fallback to localStorage if Redux doesn't have the data
  // const userData = JSON.parse(
  //   localStorage.getItem("shubhtalk_astrologer_details"),
  // );
  // const astrologerId = userData?._id || userData?.id;

  // Use Redux state as primary source
  const userData =
    astrologerDetails ||
    JSON.parse(localStorage.getItem("shubhtalk_astrologer_details") || "{}");
  const astrologerId = astrologerIdFromRedux || userData?._id || userData?.id;

  const { data: astrologerResponse } = useGetAstrologerByIdQuery(astrologerId, {
    skip: !astrologerId,
  });

  const isRegister = astrologerDetails?.isRegister;
  const isVerified = astrologerDetails?.isVerified;

  console.log("astrologerResponse",astrologerId,astrologerResponse)

  // Only check manualVerification if both isRegister and isVerified are true
  const isManualVerification = astrologerDetails?.manualVerification;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [statusState, setStatusState] = useState({
    call: { isOnline: false, loading: false },
    chat: { isOnline: false, loading: false },
  });

  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName =
    firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  const avatar =
    userData?.profileImgUrl || getDefaultImgBasedOnGender(userData?.gender);

  //Chat
  const { setActiveChat, setChatSeconds, resetTimer, recoverChatAfterSystemDisconnect } =
    useChatContext();
  const navigate = useNavigate();

  const handleStatusToggle = async (type) => {
    const currentStatus = statusState[type].isOnline;
    const isLoading = statusState[type].loading;

    if (isLoading) return;

    const newStatus = !currentStatus;

    // Optimistic UI
    setStatusState((prev) => ({
      ...prev,
      [type]: { isOnline: newStatus, loading: true },
    }));

    try {
      // Determine activeType based on both statuses
      let activeType = [];

      if (type === "call") {
        if (newStatus) activeType.push("audio", "video");
        if (statusState.chat.isOnline) activeType.push("chat");
      } else {
        if (statusState.call.isOnline) activeType.push("audio", "video");
        if (newStatus) activeType.push("chat");
      }

      const status = activeType.length > 0 ? "online" : "offline";

      const response = await updateAstrologerStatus(status, activeType);

      if (!response?.data?.success) {
        // Revert if API fails
        setStatusState((prev) => ({
          ...prev,
          [type]: { isOnline: !newStatus, loading: false },
        }));
      } else {
        const updatedUser = {
          ...userData,
          isActive: status,
          activeType: activeType,
        };

        localStorage.setItem(
          "shubhtalk_astrologer_details",
          JSON.stringify(updatedUser),
        );

        // Update Redux state to keep it synchronized with localStorage
        dispatch(setAstrologerDetails(updatedUser));

        setStatusState((prev) => ({
          ...prev,
          [type]: { isOnline: newStatus, loading: false },
        }));
      }
    } catch (error) {
      console.error(`${type} toggle error:`, error);
      setStatusState((prev) => ({
        ...prev,
        [type]: { isOnline: !newStatus, loading: false },
      }));
    }
  };

  useEffect(() => {
    const syncAstrologerStatus = async () => {
      if (!astrologerId) return;

      try {
        setStatusState((prev) => ({
          call: { ...prev.call, loading: true },
          chat: { ...prev.chat, loading: true },
        }));

        if (astrologerResponse?.success) {
          // alert("HomeLayout")
          const apiUser = astrologerResponse.data;
          const activeType = apiUser?.isActiveType || apiUser?.activeType || [];

          // Backend = source of truth
          setStatusState({
            call: {
              isOnline:
                activeType.includes("audio") || activeType.includes("video"),
              loading: false,
            },
            chat: {
              isOnline: activeType.includes("chat"),
              loading: false,
            },
          });

          // Update localStorage with latest data
          localStorage.setItem(
            "shubhtalk_astrologer_details",
            JSON.stringify(apiUser),
          );

          // Update Redux state to keep it synchronized with localStorage
          dispatch(setAstrologerDetails(apiUser));
        }
      } catch (err) {
        console.error("Status sync failed");
        setStatusState((prev) => ({
          call: { ...prev.call, loading: false },
          chat: { ...prev.chat, loading: false },
        }));
      }
    };

    syncAstrologerStatus();
  }, [astrologerId, astrologerResponse]);

  // Old: async useEffect (not supported by React)
  // useEffect(async () => {
  //   if (isManualVerification === false) {
  //     await handleStatusToggle("call")
  //     await handleStatusToggle("chat")
  //   }
  // }, [isRegister, isVerified, isManualVerification]);

  // Auto-set user offline if manualVerification is false (from API response)
  // Runs once when astrologerResponse data is available
  useEffect(() => {
    if (!astrologerResponse?.success) return;

    const apiUser = astrologerResponse.data;
    const manualVerification = apiUser?.manualVerification;

    if (manualVerification === false && apiUser?.isActiveType.length > 0) {
      const forceOffline = async () => {
        try {
          // Send status: true with activeType to deactivate audio, video, chat
          // updateAstrologerStatus("offline", []) sends { status: false, activeType: [] }
          const response = await updateAstrologerStatus("offline", []);

          if (response?.data?.success) {
            // Update local state to reflect offline
            setStatusState({
              call: { isOnline: false, loading: false },
              chat: { isOnline: false, loading: false },
            });

            const updatedUser = {
              ...userData,
              isActive: "offline",
              activeType: [],
            };

            localStorage.setItem(
              "shubhtalk_astrologer_details",
              JSON.stringify(updatedUser),
            );

            // Keep Redux in sync
            dispatch(setAstrologerDetails(updatedUser));
          }
        } catch (error) {
          console.error("Auto-offline for unverified user failed:", error);
        }
      };

      forceOffline();
    }
  }, [astrologerResponse]);

  //Handle if chat accepted by user
  useEffect(() => {
    const handleChatUserAccepted = (data) => {
      console.log("useraccept list update", data);
      const { astrologerId, roomId, userId, user } = data;
      const firstName = user?.firstName?.trim();
      const lastName = user?.lastName?.trim();

      // Capitalize first letter of each name
      const capitalizeFirstLetter = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      const formattedFirstName = capitalizeFirstLetter(firstName);
      const formattedLastName = capitalizeFirstLetter(lastName);
      const customerName =
        formattedFirstName && formattedLastName
          ? `${formattedFirstName} ${formattedLastName}`
          : formattedFirstName || "Customer";
          resetTimer();
      setActiveChat({
        roomId: roomId,
        isUserSide: false,
        chaterName: customerName,
        chaterId: userId,
        astrologerId: astrologerId,
        userID: user?.user_ID,
        remainingTime: Number(data?.remainingTime),
      });
      // if (data?.remainingTime) setChatSeconds(Number(data?.remainingTime) * 60);

      navigate(PATH.privateRoutes.CHAT_WINDOW.path.replace(":chatId", userId), {
        state: {
          userId: userId,
          astrologerId: astrologerId,
          fullName: customerName,
          roomId: roomId,
          isUserSide: false,
          kundliId: null,
        },
      });
    };

    const handleChatEnd = (data) => {
      console.log("[HomeLayout] chat:ended", JSON.stringify(data, null, 2));
      if (recoverChatAfterSystemDisconnect(data)) {
        return;
      }
      toast.warning("Chat has ended");
      setActiveChat(null);
    };

    // Listen for chat end events
    voiceSocket.on("chat:accepted", handleChatUserAccepted);
    voiceSocket.on("chat:ended", handleChatEnd);
    voiceSocket.on("chat_ended", handleChatEnd); // Alternative event name

    return () => {
      voiceSocket.off("chat:accepted", handleChatUserAccepted);
      voiceSocket.off("chat:ended", handleChatEnd);
      voiceSocket.off("chat_ended", handleChatEnd);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <MiniLiveBar />
        <header className={`${styles.header} ${kundliId ? styles.hidden : ""}`}>
          <div className={styles.headerContent}>
            {/* LEFT: Profile + Info */}
            <div className={styles.leftSection}>
              {/* Mobile menu */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={styles.menuButton}
              >
                <Icons.Menu size={22} />
              </button>

              {/* Avatar */}
              <div className={styles.avatarWrapper}>
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarInner}>
                    <div className={styles.avatar}>
                      <img
                        src={avatar || AppDefaultImg.DefaultMaleAstrologer}
                        alt="Profile"
                      />
                    </div>
                    <div
                      className={`${styles.statusDot} ${
                        statusState.call.isOnline || statusState.chat.isOnline
                          ? styles.online
                          : styles.offline
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Name + Date */}
              <div className={styles.userInfo}>
                <p className={styles.greeting}>Namaste</p>
                <p className={styles.userName}>{userName}</p>
                <p className={styles.date}>
                  {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>

            {/* RIGHT: Followers + Status */}
            {isManualVerification && (
              <div className={styles.rightSection}>
                <p className={styles.followers}>1.15k followers</p>

                <div className={styles.statusButtons}>
                  {/* Call Button */}
                  <button
                    disabled={statusState.call.loading}
                    onClick={() => handleStatusToggle("call")}
                    className={`${styles.statusButton} ${
                      statusState.call.isOnline
                        ? styles.active
                        : styles.inactive
                    } ${statusState.call.loading ? styles.loading : ""}`}
                  >
                    <span
                      className={`${styles.statusLabel} ${
                        statusState.call.isOnline
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      Call
                    </span>
                    <div
                      className={`${styles.statusIcon} ${
                        statusState.call.isOnline
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      <Icons.Phone size={18} strokeWidth={2.5} />
                    </div>
                  </button>

                  {/* Chat Button */}
                  <button
                    disabled={statusState.chat.loading}
                    onClick={() => handleStatusToggle("chat")}
                    className={`${styles.statusButton} ${
                      statusState.chat.isOnline
                        ? styles.active
                        : styles.inactive
                    } ${statusState.chat.loading ? styles.loading : ""}`}
                  >
                    <span
                      className={`${styles.statusLabel} ${
                        statusState.chat.isOnline
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      Chat
                    </span>
                    <div
                      className={`${styles.statusIcon} ${
                        statusState.chat.isOnline
                          ? styles.active
                          : styles.inactive
                      }`}
                    >
                      <Icons.MessageSquare size={18} strokeWidth={2.5} />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <Suspense fallback="..Loading">
          <div className={styles.content}>
            <Outlet />
          </div>
        </Suspense>

        {/* Bottom padding for mobile nav if needed */}
        <div className={styles.bottomSpacer}></div>
        <AudioVideoContainer />
        <IncomingChatModal />
        <StickyReviewFooter />
        <StickyChatFooter />
      </main>
    </div>
  );
};

export default HomeLayout;
