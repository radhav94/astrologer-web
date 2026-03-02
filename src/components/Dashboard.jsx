import { Icons } from "./Icons";
import { DonutChart, Heatmap } from "./Charts";
import { Link, useNavigate } from "react-router-dom";
import TipsCarousel from "../screens/private/Home/tipsAndGrowth/TipsCarousel";
import * as AuthServices from "../../src/services/appServices/authservice";
import { useGetAstrologerByIdQuery, useGetMonthlyOverviewQuery } from "../redux/astrologer/astrologerApi";
import calendarImage from "../assets/images/calender.png";
import { appSvgs } from "../utils/appImages";
import { useState, useMemo, useEffect } from "react";
import { useCall } from "../context/CallContext";
import { useChat } from "../context/chatContext";
import SectionHeader from "./UI/SectionHeader";

const Dashboard = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  const astrologerId = userData?._id || userData?.id;
  const { data } = useGetAstrologerByIdQuery(astrologerId);
  const astrologerData = data?.data || {};

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
  
  // Format session duration - use callTimer for calls, chatSeconds for chats
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00";
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Get the appropriate timer value
  const getSessionDuration = () => {
    if (activeCall) {
      return formatDuration(callTimer);
    }
    if (activeChat) {
      return formatDuration(chatSeconds);
    }
    return "--:--";
  };
  
  // Get customer name and session type
  const getActiveSessionInfo = () => {
    if (activeCall) {
      const customerName = activeCall.callerName || "Customer";
      const sessionType = activeCall.callType === "video" ? "Video Call" : "Call";
      const userId = activeCall.userID || activeCall.userId || "";
      return { customerName, sessionType, userId, type: activeCall.callType };
    }
    if (activeChat) {
      const customerName = activeChat.chaterName || "Customer";
      const sessionType = "Chat";
      const userId = activeChat.userID || activeChat.chaterrId || "";
      return { customerName, sessionType, userId, type: "chat" };
    }
    return { customerName: "No Active Session", sessionType: "", userId: "", type: null };
  };

  const sessionInfo = getActiveSessionInfo();

  // Handle click on Current Status card
  const handleCurrentStatusClick = () => {
    if (!isActiveSession) return; // Do nothing if no active session

    return;
  };

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
  
  // Get total earnings from monthly overview
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

  // Calculate percentage for each category
  const categoryPercentages = useMemo(() => {
    if (!monthlyOverview.categories || monthlyOverview.totalIncome === 0) return [];
    return monthlyOverview.categories.map((cat) => ({
      ...cat,
      percentage: ((cat.amount / monthlyOverview.totalIncome) * 100).toFixed(0),
    }));
  }, [monthlyOverview.categories, monthlyOverview.totalIncome]);

  // Format month name
  const monthName = monthlyOverview.period?.monthName || "Current Month";
  return (
    <div className="space-y-6 bg-[#F5F5F5] lg:bg-transparent -m-4 p-4 lg:m-0 lg:p-0">
      {/* Top Row: Price & Schedule */}
      <div className="grid grid-cols-1">
        {/* Consultation Price Card */}
        <div className="bg-[#FFE4BA] rounded-3xl p-6 sm:p-8 lg:p-6 text-left shadow-sm relative overflow-hidden">
          {/* Title, Description and Button */}
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 lg:mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg sm:text-3xl lg:text-2xl text-[#2D2D2D] mb-2 sm:mb-3 lg:mb-2 whitespace-nowrap">
                Set Consultation Price
              </h3>
              <p className="text-[#6B7280] text-sm sm:text-lg lg:text-base">
                Update your per-minute rate for calls and chats.
              </p>
            </div>
            
            {/* Button - Always on the right, aligned to top */}
            <Link
              to="/set-your-consultation-price"
              className="bg-gradient-to-r from-[#F75801] to-[#D43400] text-white px-5 sm:px-8 lg:px-6 py-2.5 sm:py-3.5 lg:py-2.5 rounded-full text-sm sm:text-lg lg:text-base font-semibold inline-flex items-center gap-1.5 sm:gap-2 hover:from-[#E54E00] hover:to-[#C32F00] transition-all shadow-lg whitespace-nowrap flex-shrink-0"
            >
              Set Now <Icons.ChevronRight size={18} className="sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px]" />
            </Link>
          </div>

          {/* Current Rates Section */}
          <div className="bg-[#FFF5EC] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Current Rates Label */}
              <div className="flex flex-col justify-center min-w-[75px] sm:min-w-[120px] lg:min-w-[100px]">
                <p className="text-base sm:text-xl lg:text-lg font-normal text-[#2D2D2D] leading-tight">
                  Current<br />Rates
                </p>
              </div>

              {/* Chat Rate */}
              <div className="flex flex-col items-center flex-1">
                <img src={appSvgs.ChatIcon} alt="Chat" className="w-7 h-7 sm:w-10 sm:h-10 lg:w-8 lg:h-8 mb-1 sm:mb-2 lg:mb-1.5 object-contain" />
                <p className="text-sm sm:text-3xl lg:text-2xl font-bold text-[#2D2D2D] whitespace-nowrap">
                  ₹{astrologerData?.price?.chatRate?.amount || 0}/m
                </p>
              </div>

              {/* Call Rate */}
              <div className="flex flex-col items-center flex-1">
                <img src={appSvgs.AudioIcon} alt="Call" className="w-7 h-7 sm:w-10 sm:h-10 lg:w-8 lg:h-8 mb-1 sm:mb-2 lg:mb-1.5 object-contain" />
                <p className="text-sm sm:text-3xl lg:text-2xl font-bold text-[#2D2D2D] whitespace-nowrap">
                  ₹{astrologerData?.price?.audioRate?.amount || 0}/m
                </p>
              </div>

              {/* Video Rate */}
              <div className="flex flex-col items-center flex-1">
                <img src={appSvgs.VideoIcon} alt="Video" className="w-7 h-7 sm:w-10 sm:h-10 lg:w-8 lg:h-8 mb-1 sm:mb-2 lg:mb-1.5 object-contain" />
                <p className="text-sm sm:text-3xl lg:text-2xl font-bold text-[#2D2D2D] whitespace-nowrap">
                  ₹{astrologerData?.price?.videoCallRate?.amount || 0}/m
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Update */}
      <div>
        <div className="flex items-center justify-center mb-6">
          <SectionHeader title="TODAY'S UPDATE" />
        </div>

        {/* GRID - Same 2-column layout on all screen sizes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-4">
          {/* CURRENT STATUS */}
          <div 
            onClick={handleCurrentStatusClick}
            className={`bg-gradient-to-br from-[#4CAF50] to-[#45A049] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col relative overflow-hidden h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[260px] shadow-md ${isActiveSession ? 'cursor-pointer hover:shadow-lg transition-shadow' : 'cursor-default'}`}
          >
            {/* Icon */}
            <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-16 lg:h-16 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <img src={appSvgs.OngoingCall} alt="Ongoing Call" className="w-10 h-10 sm:w-14 sm:h-14 lg:w-11 lg:h-11" />
            </div>

            <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 lg:py-4">
              <p className="text-white text-lg sm:text-2xl lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-1">
                Current Status
              </p>
              <p className="text-white/90 text-base sm:text-xl lg:text-lg font-normal">
                {isActiveSession ? getSessionDuration() : "--:--"}
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-xl p-3 sm:p-4 lg:p-3 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-2 text-[#2D2D2D]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  {sessionInfo.type === "chat" ? (
                    <Icons.MessageSquare size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                  ) : sessionInfo.type === "video" ? (
                    <Icons.Video size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                  ) : (
                    <Icons.Phone size={18} className="text-[#4CAF50] sm:w-[22px] sm:h-[22px] lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                  )}
                </div>
                <p className="font-semibold text-xs sm:text-base lg:text-sm leading-tight">
                  {isActiveSession ? (
                    <>
                      Ongoing {sessionInfo.sessionType} with<br />
                      {sessionInfo.userId && `#${sessionInfo.userId} `}{sessionInfo.customerName}
                    </>
                  ) : (
                    <>
                      No Active Session<br />
                      Ready to Connect
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (EARNINGS + NEXT SESSION) */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-4">
            {/* TODAY'S EARNINGS */}
            <div className="bg-gradient-to-br from-[#FFF5E8] to-[#FFE8D4] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col justify-center min-h-[135px] sm:min-h-[150px] lg:min-h-[120px]">
              <h3 className="text-3xl sm:text-5xl lg:text-4xl font-bold text-[#2D2D2D] mb-1 sm:mb-2 lg:mb-1">
                ₹{totalEarnings.toLocaleString('en-IN')}
              </h3>
              <p className="text-[#9CA3AF] text-sm sm:text-lg lg:text-base font-normal">
                Total Earning
              </p>
            </div>

            {/* NEXT SESSION */}
            <div className="bg-gradient-to-br from-[#E7EEF8] to-[#B8D4F1] rounded-2xl sm:rounded-3xl lg:rounded-2xl p-4 sm:p-6 lg:p-5 flex flex-col justify-center min-h-[135px] sm:min-h-[150px] lg:min-h-[120px]">
              <h3 className="text-2xl sm:text-4xl lg:text-3xl font-bold text-[#2D2D2D] mb-1 sm:mb-2 lg:mb-1">
                {totalQueue} in Queue
              </h3>
              <p className="text-[#9CA3AF] text-sm sm:text-lg lg:text-base font-normal mb-3 sm:mb-4 lg:mb-3">
                Next Session
              </p>

              <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-xl px-3 py-2.5 sm:px-5 sm:py-3.5 lg:px-4 lg:py-2.5 flex items-center justify-center gap-2 sm:gap-4 lg:gap-3">
                <span className="text-[#6B7280] text-sm sm:text-lg lg:text-base font-semibold">
                  {chatQueue} Chat
                </span>
                <span className="text-[#D1D5DB] text-xl sm:text-2xl lg:text-xl font-light">|</span>
                <span className="text-[#6B7280] text-sm sm:text-lg lg:text-base font-semibold">
                  {callQueue} Call
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <SectionHeader title="UPCOMING SESSIONS" />
          <Link
            to="/upcoming-sessions"
            className="text-base text-[#FF6B35] hover:text-[#E55A2B] font-semibold flex items-center gap-1 ml-4"
          >
            View All <Icons.ArrowRight size={18} />
          </Link>
        </div>

        {waitingList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-[#6B7280] text-lg">No upcoming sessions at the moment</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
            {waitingList.slice(0, 5).map((session) => {
              const customerName = session.user?.customer?.firstName 
                ? `${session.user.customer.firstName} ${session.user.customer.lastName || ''}`.trim()
                : "Anonymous User";
              const userImage = session.user?.customer?.imageUrl || session.user?.customer?.profileImage;
              
              return (
                <div
                  key={session._id || session.roomId}
                  className="min-w-[220px] sm:min-w-[320px] bg-white rounded-2xl sm:rounded-3xl shadow-md snap-start border border-gray-100 overflow-hidden flex-shrink-0"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    {userImage ? (
                      <img 
                        src={userImage} 
                        alt={customerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FFE8C5] to-[#FFD4A3] flex items-center justify-center">
                        <span className="text-4xl sm:text-6xl font-bold text-[#FF6B35]">
                          {(session.user?.customer?.firstName || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Time Badge */}
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-md">
                      <Icons.Clock size={14} className="text-[#FF6B35] sm:w-4 sm:h-4" strokeWidth={2.5} />
                      <span className="text-xs sm:text-sm font-medium text-[#6B7280]">10 min</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5">
                    <h4 className="font-bold text-[#2D2D2D] text-base sm:text-xl mb-1.5 sm:mb-2">
                      {customerName}
                    </h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[#6B7280]">
                      {session.type === "chat" ? (
                        <Icons.MessageSquare size={16} className="text-[#FF6B35] sm:w-5 sm:h-5" strokeWidth={2} />
                      ) : session.type === "video" ? (
                        <Icons.Video size={16} className="text-[#FF6B35] sm:w-5 sm:h-5" strokeWidth={2} />
                      ) : (
                        <Icons.Phone size={16} className="text-[#FF6B35] sm:w-5 sm:h-5" strokeWidth={2} />
                      )}
                      <p className="text-sm sm:text-base font-normal text-[#6B7280] capitalize">
                        {session.type === "chat" ? "Chat" : "Call"} session
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add a ghost card for spacing/padding on mobile scroll */}
            <div className="min-w-[20px]"></div>
          </div>
        )}
      </div>

      {/* Availability Schedule */}
      <div className="relative bg-[#F8F9FA] rounded-[28px] sm:rounded-[32px] lg:rounded-[28px] p-6 sm:p-8 lg:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden min-h-[320px] sm:min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0 sm:gap-8 lg:gap-10">
          {/* Left Content */}
          <div className="flex-1 w-full sm:w-auto z-20 relative pb-32 sm:pb-0">
            <h3 className="font-bold text-[22px] text-left leading-[1.3] sm:text-[28px] lg:text-[26px] text-[#2D2D2D] mb-3 sm:mb-4 lg:mb-3">
              No Calls Scheduled,<br />Update Availability
            </h3>
            <p className="text-[#6B7280] text-[14px] leading-[1.6] sm:text-[16px] lg:text-[15px] mb-6 sm:mb-7 lg:mb-6 max-w-[420px]">
              Curate your calendars based on availability.
            </p>
            <Link
              to="/profile"
              state={{ data: "availability" }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#F75801] hover:from-[#F75801] hover:to-[#E54E00] text-white px-8 sm:px-9 lg:px-8 py-[13px] sm:py-[14px] lg:py-[12px] rounded-full text-[15px] sm:text-[16px] lg:text-[15px] font-semibold transition-all shadow-[0_4px_12px_rgba(255,107,53,0.3)] hover:shadow-[0_6px_16px_rgba(255,107,53,0.4)]"
            >
              Set Now <Icons.ChevronRight size={18} className="sm:w-5 sm:h-5 lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Right Image - Calendar with circular background */}
          <div className="absolute bottom-4 right-4 sm:relative sm:bottom-auto sm:right-auto w-[200px] sm:w-[300px] lg:w-[320px] h-[200px] sm:h-[300px] lg:h-[320px] flex items-center justify-center flex-shrink-0 z-10">
            {/* Large Circular beige background - positioned behind and slightly offset */}
            <div className="absolute w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[320px] lg:h-[320px] bg-gradient-to-br from-[#FFF8F0] via-[#FFF3E6] to-[#FFECD9] rounded-full"></div>
            
            {/* Calendar Image - Larger and overlapping circle */}
            <div className="relative z-10">
              <img 
                src={calendarImage}
                alt="Calendar"
                className="w-[180px] sm:w-[280px] lg:w-[300px] h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Overview & Stats */}
      <div className="space-y-4 lg:space-y-6">
        {/* Monthly Overview Section */}
        <div className="space-y-4 lg:space-y-6">
          {/* Header and Month Selector - OUTSIDE the beige box */}
          <div className="flex items-center justify-between">
            <SectionHeader title="MONTHLY OVERVIEW" />
            <div className="bg-white border border-[#D1D5DB] px-4 py-2 rounded-full text-sm font-normal text-[#FF6B35] flex items-center gap-2 ml-4">
              {isMonthlyLoading ? "Loading..." : monthName} <Icons.ChevronDown size={16} className="text-[#FF6B35]" />
            </div>
          </div>

          {/* Monthly Overview Content - INSIDE the beige box */}
          <div className="bg-[#FFF8F0] rounded-[2rem] p-3 sm:p-6 shadow-sm border border-[#F0E5D8]">

            {/* Layout: Top row side-by-side, then full-width sections */}
            <div className="space-y-3 sm:space-y-4">
              {/* TOP ROW: Earnings and Key Metrics Chart - Side by Side */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Earnings */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFA726] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-base sm:text-xl font-bold">₹</span>
                    </div>
                    <p className="text-[#9E9E9E] text-[10px] sm:text-sm font-normal leading-tight">
                      Earnings this<br className="sm:hidden" /> month
                    </p>
                  </div>
                  <h3 className="text-xl sm:text-4xl font-bold text-[#212121] mb-1.5 sm:mb-2">
                    {isMonthlyLoading ? "..." : `₹${(totalMonthlyEarnings / 1000).toFixed(1)}K`}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1">
                    <span className="bg-[#E8F5E9] text-[#4CAF50] text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md inline-flex items-center gap-1">
                      +3.67% ↑
                    </span>
                  </div>
                </div>

                {/* Key Metrics Donut Chart */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                  <p className="text-[10px] sm:text-sm font-normal text-[#9E9E9E] mb-2 sm:mb-3">Key metrics</p>
                  {isMonthlyLoading ? (
                    <div className="flex items-center justify-center h-24 sm:h-32 text-[#9E9E9E] text-xs">Loading...</div>
                  ) : metricsData.length > 0 ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                      <DonutChart data={metricsData} />
                      <div className="space-y-1 sm:space-y-2">
                        {categoryPercentages.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm">
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: metricsData[idx]?.fill }}
                            />
                            <span className="text-[#9E9E9E] w-7 sm:w-12 font-normal">{item.label}</span>
                            <span className="font-semibold text-[#212121]">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 sm:h-32 text-[#9E9E9E] text-xs">No data</div>
                  )}
                </div>
              </div>

              {/* MIDDLE: Key Metrics Icons - Full Width */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                <h4 className="text-[10px] sm:text-sm font-normal text-[#9E9E9E] mb-3 sm:mb-4">
                  Key Metrics
                </h4>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#FF5722] flex items-center justify-center text-white mb-2 sm:mb-3 shadow-sm">
                      <Icons.Star size={14} className="sm:w-6 sm:h-6" fill="currentColor" />
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-[#212121] mb-0.5 sm:mb-1">
                      {isMonthlyLoading ? "..." : (monthlyOverview.metrics?.averageRating || 0).toFixed(1)}
                    </p>
                    <p className="text-[9px] sm:text-xs text-[#9E9E9E] font-normal leading-tight">
                      Average<br />Rating
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#FF5722] flex items-center justify-center text-white mb-2 sm:mb-3 shadow-sm">
                      <Icons.Clock size={14} className="sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-[#212121] mb-0.5 sm:mb-1">
                      {isMonthlyLoading ? "..." : `${Math.round(monthlyOverview.metrics?.averageResponseTimeMinutes?.chat || 0)} min`}
                    </p>
                    <p className="text-[9px] sm:text-xs text-[#9E9E9E] font-normal leading-tight">
                      Average<br />Response Time
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#FF5722] flex items-center justify-center text-white mb-2 sm:mb-3 shadow-sm">
                      <Icons.FileText size={14} className="sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-sm sm:text-xl font-bold text-[#212121] mb-0.5 sm:mb-1">
                      {isMonthlyLoading ? "..." : `${Math.round(monthlyOverview.metrics?.repeatSessionsPercent || 0)}%`}
                    </p>
                    <p className="text-[9px] sm:text-xs text-[#9E9E9E] font-normal leading-tight">
                      Repeat<br />sessions
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTTOM: Monthly Sessions Heatmap - Full Width */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                <h4 className="text-[10px] sm:text-sm font-normal text-[#9E9E9E] mb-3 sm:mb-4">
                  Monthly Sessions
                </h4>
                <div className="overflow-x-auto">
                  {isMonthlyLoading ? (
                    <div className="flex items-center justify-center h-48 sm:h-64 text-[#9E9E9E] text-xs">Loading...</div>
                  ) : heatmapData.length > 0 ? (
                    <Heatmap data={heatmapData} />
                  ) : (
                    <div className="flex items-center justify-center h-48 sm:h-64 text-[#9E9E9E] text-xs">No sessions data</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <SectionHeader title="MILESTONES" />
          </div>

          {/* Horizontal scrollable container for milestone cards */}
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory">
            {/* Milestone Card 1 */}
            <div className="min-w-[320px] sm:min-w-[400px] flex-shrink-0 bg-gradient-to-br from-[#FFE8C5] to-[#FFD4A3] rounded-3xl p-6 shadow-sm snap-start">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2D2D] text-xl">
                      Earn More with<br />Milestones!
                    </h4>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#2D2D2D] mb-1">₹30,000</p>
                  <p className="text-sm text-[#6B7280]">
                    projected earning<br />for the month
                  </p>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '0%' }}></div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8B6914] to-[#6B4E0F] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white text-lg">🏆</span>
                  </div>
                  <span className="text-lg font-bold text-[#2D2D2D]">0/15</span>
                </div>
              </div>

              <p className="text-base text-[#6B7280]">
                Complete 2 more sessions to start getting ₹30/min
              </p>
            </div>

            {/* Milestone Card 2 - Example */}
            <div className="min-w-[320px] sm:min-w-[400px] flex-shrink-0 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-3xl p-6 shadow-sm snap-start">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2D2D] text-xl">
                      Session<br />Master!
                    </h4>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#2D2D2D] mb-1">₹50,000</p>
                  <p className="text-sm text-[#6B7280]">
                    projected earning<br />for the month
                  </p>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#4CAF50] rounded-full" style={{ width: '20%' }}></div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white text-lg">🏆</span>
                  </div>
                  <span className="text-lg font-bold text-[#2D2D2D]">3/30</span>
                </div>
              </div>

              <p className="text-base text-[#6B7280]">
                Complete 27 more sessions to unlock ₹50/min rate
              </p>
            </div>

            {/* Milestone Card 3 - Example */}
            <div className="min-w-[320px] sm:min-w-[400px] flex-shrink-0 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-3xl p-6 shadow-sm snap-start">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl flex-shrink-0 shadow-md">
                    ⭐
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D2D2D] text-xl">
                      Rating<br />Champion!
                    </h4>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#2D2D2D] mb-1">Bonus</p>
                  <p className="text-sm text-[#6B7280]">
                    ₹5,000<br />reward
                  </p>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-[#2196F3] rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1976D2] to-[#0D47A1] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white text-lg">🏆</span>
                  </div>
                  <span className="text-lg font-bold text-[#2D2D2D]">4.5/5.0</span>
                </div>
              </div>

              <p className="text-base text-[#6B7280]">
                Maintain 5.0 rating for bonus rewards
              </p>
            </div>

            {/* Add spacing at the end */}
            <div className="min-w-[20px]"></div>
          </div>
        </div>
      </div>

      {/* Tips and Growth */}
      <TipsCarousel />
    </div>
  );
};

export default Dashboard;
