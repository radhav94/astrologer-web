import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetAstrologerByIdQuery, useGetMonthlyOverviewQuery } from "../../../redux/astrologer/astrologerApi";
import * as AuthServices from "../../../services/appServices/authservice";
import { useCall } from "../../../context/CallContext";
import { useChat } from "../../../context/chatContext";
import { SECTION_TYPES } from "../../../constants/sectionTypes";
import { useHomepageSections } from "../../../hooks/useHomepageSections";
import { PATH } from "../../../utils/routes/Paths";
import TipsCarousel from "../../../screens/private/Home/tipsAndGrowth/TipsCarousel";
import PrimaryLoader from "../../../components/UI/PrimaryLoader";

// Import section components
import {
  ConsultationPriceSection,
  TodaysUpdatesSection,
  UpcomingSessionsSection,
  AvailabilityScheduleSection,
  MonthlyOverviewSection,
  MilestonesSection,
  PendingVerificationSection,
} from "../../../components/Dashboard/sections";

/**
 * Dashboard Component
 * Sections are dynamically shown/hidden and ordered via homepage API
 */
const Dashboard = () => {
  const navigate = useNavigate();

  // Check verification status from Redux state
  const astrologerDetails = useSelector((state) => state.register?.astrologerDetails);
  const isRegister = astrologerDetails?.isRegister ?? false;
  const isVerified = astrologerDetails?.isVerified ?? false;

  // Only check manualVerification if both isRegister and isVerified are true
  const isManualVerification = (isRegister && isVerified)
    ? (astrologerDetails?.manualVerification ?? false)
    : false;

  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  const astrologerId = userData?._id || userData?.id;
  const { data } = useGetAstrologerByIdQuery(astrologerId);
  const astrologerData = data?.data || {};

  

  // Fetch homepage sections with ordering
  const { orderedSections, tipsContent, isLoading: isSectionsLoading } = useHomepageSections();

  // Get waiting list, active call, and call timer from CallContext
  const { waitingList, activeCall, callTimer } = useCall();
  
  // Get active chat and chat timer from ChatContext
  const { activeChat, chatSeconds } = useChat();

  // Calculate queue counts
  const chatQueue = waitingList.filter(item => item.type === "chat").length;
  const callQueue = waitingList.filter(item => item.type === "audio" || item.type === "video").length;
  const totalQueue = waitingList.length;

  // Determine active session info
  const activeSession = activeCall || activeChat;
  const isActiveSession = !!activeSession;
  
  // Format session duration
  const formatDuration = useCallback((seconds) => {
    if (!seconds || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);
  
  // Get the appropriate timer value
  const getSessionDuration = useCallback(() => {
    if (activeCall) {
      return formatDuration(callTimer);
    }
    if (activeChat) {
      return formatDuration(chatSeconds);
    }
    return "--:--";
  }, [activeCall, activeChat, callTimer, chatSeconds, formatDuration]);
  
  // Get customer name and session type
  const getActiveSessionInfo = useCallback(() => {
    if (activeCall) {
      const customerName = activeCall.callerName || "Customer";
      const sessionType = activeCall.callType === "video" ? "Video Call" : "Call";
      const userId = activeCall.userID || activeCall.userId || "";
      return { customerName, sessionType, userId, type: activeCall.callType };
    }
    if (activeChat) {
      const customerName = activeChat.chaterName || "Customer";
      const sessionType = "Chat";
      const userId = activeChat.userID || activeChat.chaterId || "";
      return { customerName, sessionType, userId, type: "chat" };
    }
    return { customerName: "No Active Session", sessionType: "", userId: "", type: null };
  }, [activeCall, activeChat]);

  const sessionInfo = getActiveSessionInfo();

  // Handle click on Current Status card
  const handleCurrentStatusClick = useCallback(() => {
    
    if (!isActiveSession) {
      console.log("⚠️ No active session");
      return;
    }
    
    // If there's an active chat, navigate to chat window with proper state
    if (activeChat) {
      // chaterId is the MongoDB _id, userID is the numeric user_ID
      const chatId = activeChat.chaterId || activeChat.userId;
      const userID = activeChat.userID;
      
      
      if (chatId) {
        navigate(
          PATH.privateRoutes.CHAT_WINDOW.path.replace(":chatId", chatId),
          {
            state: {
              userId: chatId,
              astrologerId: astrologerId,
              fullName: activeChat.chaterName || "Customer",
              roomId: activeChat.roomId,
              isUserSide: false,
              kundliId: null,
              userID: userID
            },
          }
        );
      } else {
        console.log("❌ No chatId found in activeChat");
      }
    } else {
      console.log("ℹ️ Active call detected, not navigating (call UI already visible)");
    }
  }, [isActiveSession, activeChat, navigate, astrologerId]);

  // Monthly overview state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fetch total earnings
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      const response = await AuthServices.totalEarning();
      const earnings = response?.data?.data?.[0]?.amount || 0;
      setTotalEarnings(earnings);
    };
    fetchTotalEarnings();
  }, []);

  // Fetch monthly overview data
  const { data: monthlyData, isLoading: isMonthlyLoading } = useGetMonthlyOverviewQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const monthlyOverview = monthlyData?.data || {};
  const totalMonthlyEarnings = monthlyOverview.totalIncome || 0;

  // Transform API data for charts
  const metricsData = useMemo(() => {
    if (!monthlyOverview.categories) return [];
    return monthlyOverview.categories.map((cat) => {
      const colors = {
        Call: "#10B981",
        Chat: "#3B82F6",
        Video: "#FF6B35",
        Gifts: "#F59E0B",
      };
      return {
        name: cat.label,
        value: cat.amount,
        fill: colors[cat.label] || "#9CA3AF",
      };
    });
  }, [monthlyOverview.categories]);

  const heatmapData = useMemo(() => {
    if (!monthlyOverview.monthlySessions) return [];
    return monthlyOverview.monthlySessions.map((session) => ({
      day: session.day,
      value: session.count,
    }));
  }, [monthlyOverview.monthlySessions]);

  const categoryPercentages = useMemo(() => {
    if (!monthlyOverview.categories || monthlyOverview.totalIncome === 0) return [];
    return monthlyOverview.categories.map((cat) => ({
      ...cat,
      percentage: ((cat.amount / monthlyOverview.totalIncome) * 100).toFixed(0),
    }));
  }, [monthlyOverview.categories, monthlyOverview.totalIncome]);

  const monthName = monthlyOverview.period?.monthName || "Current Month";

  /**
   * Section registry mapping display_type to component
   * Each section receives the props it needs
   */
  const sectionRegistry = useMemo(() => ({
    [SECTION_TYPES.CONSULTATION_PRICE]: {
      component: ConsultationPriceSection,
      props: { astrologerData },
    },
    [SECTION_TYPES.TODAYS_UPDATES]: {
      component: TodaysUpdatesSection,
      props: {
        isActiveSession,
        sessionInfo,
        getSessionDuration,
        handleCurrentStatusClick,
        totalEarnings,
        totalQueue,
        chatQueue,
        callQueue,
      },
    },
    [SECTION_TYPES.UPCOMING_SESSIONS]: {
      component: UpcomingSessionsSection,
      props: { waitingList },
    },
    [SECTION_TYPES.AVAILABILITY_SCHEDULE]: {
      component: AvailabilityScheduleSection,
      props: {},
    },
    [SECTION_TYPES.MONTHLY_OVERVIEW]: {
      component: MonthlyOverviewSection,
      props: {
        monthName,
        isMonthlyLoading,
        totalMonthlyEarnings,
        metricsData,
        categoryPercentages,
        monthlyOverview,
        heatmapData,
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
      },
    },
    [SECTION_TYPES.MILESTONES]: {
      component: MilestonesSection,
      props: {},
    },
    [SECTION_TYPES.TIPS_AND_GROWTH]: {
      component: TipsCarousel,
      props: { tips: tipsContent },
    },
  }), [
    astrologerData,
    isActiveSession,
    sessionInfo,
    getSessionDuration,
    handleCurrentStatusClick,
    totalEarnings,
    totalQueue,
    chatQueue,
    callQueue,
    waitingList,
    monthName,
    isMonthlyLoading,
    totalMonthlyEarnings,
    metricsData,
    categoryPercentages,
    monthlyOverview,
    heatmapData,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    tipsContent,
  ]);

  /**
   * Render section based on display_type
   * Returns null if section not found in registry
   */
  const renderSection = useCallback((section) => {
    const sectionConfig = sectionRegistry[section.display_type];
    
    if (!sectionConfig) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Dashboard] Unknown section type: ${section.display_type}`);
      }
      return null;
    }

    const SectionComponent = sectionConfig.component;
    return (
      <div key={section.display_type}>
        <SectionComponent {...sectionConfig.props} />
      </div>
    );
  }, [sectionRegistry]);

  // If user is not fully verified, show pending message card
  if (!isManualVerification) {
    return <PendingVerificationSection />;
  }

  return (
    <div className="space-y-6 bg-[#F5F5F5] lg:bg-transparent -m-4 p-4 lg:m-0 lg:p-0">
      {/* Show loader while fetching sections */}
      {isSectionsLoading ? (
        <PrimaryLoader 
          isLoading={true} 
          fullscreen={false}
          message="Loading dashboard..."
        />
      ) : (
        /* All sections are now dynamically ordered by API */
        orderedSections.map(renderSection)
      )}
    </div>
  );
};

export default Dashboard;
