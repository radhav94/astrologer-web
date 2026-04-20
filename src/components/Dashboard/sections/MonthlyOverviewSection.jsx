import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icons } from "../../Icons";
import { DonutChart, Heatmap } from "../../Charts";
import SectionHeader from "../../UI/SectionHeader";
import useClickOutside from "../../../hooks/useClickOutside";

const MonthlyOverviewSection = ({
  overviewTitle,
  isMonthlyLoading,
  totalMonthlyEarnings,
  metricsData,
  categoryPercentages,
  monthlyOverview,
  heatmapData,
  overviewOptions,
  selectedOverviewOption,
  setSelectedOverviewOption,
  customFromDate,
  customToDate,
  setCustomFromDate,
  setCustomToDate,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);
  const closeDatePicker = useCallback(() => setIsDatePickerOpen(false), []);
  const dropdownRef = useClickOutside(closeDropdown, isDropdownOpen);
  const datePickerRef = useClickOutside(closeDatePicker, isDatePickerOpen);

  const handleOptionSelect = useCallback((option) => {
    setSelectedOverviewOption(option);
    setIsDropdownOpen(false);
    if (option.value === "custom") {
      setIsDatePickerOpen(true);
    } else {
      setCustomFromDate(null);
      setCustomToDate(null);
      setIsDatePickerOpen(false);
    }
  }, [setSelectedOverviewOption, setCustomFromDate, setCustomToDate]);

  const handleDateRangeChange = useCallback((dates) => {
    const [start, end] = dates;
    setCustomFromDate(start);
    setCustomToDate(end);
    if (start && end) setIsDatePickerOpen(false);
  }, [setCustomFromDate, setCustomToDate]);

  const isCustom = selectedOverviewOption?.value === "custom";
  const safeTotalMonthlyEarnings = Number(totalMonthlyEarnings || 0);

  const formatCurrency = () => {
    if (safeTotalMonthlyEarnings >= 100000) return `₹${(safeTotalMonthlyEarnings / 1000).toFixed(0)}K`;
    if (safeTotalMonthlyEarnings >= 1000) return `₹${(safeTotalMonthlyEarnings / 1000).toFixed(1)}K`;
    return `₹${safeTotalMonthlyEarnings.toLocaleString("en-IN")}`;
  };

  const getButtonLabel = () => {
    if (isMonthlyLoading) return "Loading...";
    if (isCustom && customFromDate && customToDate) {
      const fmt = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      return `${fmt(customFromDate)} – ${fmt(customToDate)}`;
    }
    if (isCustom) return "Pick range";
    return selectedOverviewOption?.label || "Select";
  };

  const metricItems = [
    { icon: <Icons.Star size={14} fill="currentColor" />, value: isMonthlyLoading ? "..." : (monthlyOverview.metrics?.averageRating || 0).toFixed(1), label: "Avg Rating", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    { icon: <Icons.Clock size={14} />, value: isMonthlyLoading ? "..." : `${Math.round(monthlyOverview.metrics?.averageResponseTimeMinutes?.chat || 0)}m`, label: "Response Time", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
    { icon: <Icons.RefreshCw size={14} />, value: isMonthlyLoading ? "..." : `${Math.round(monthlyOverview.metrics?.repeatSessionsPercent || 0)}%`, label: "Repeat Rate", color: "#4BA01D", bg: "rgba(75,160,29,0.08)" },
  ];

  return (
    <div>
      {/* Main card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Metrics strip — commented out
        <div className="grid grid-cols-3 border-t border-[rgba(0,0,0,0.04)]">
          {metricItems.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-2.5 px-4 py-3.5 ${idx < 2 ? "border-r border-[rgba(0,0,0,0.04)]" : ""}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A] leading-none">{item.value}</p>
                <p className="text-[10px] text-[#9CA3AF] font-medium mt-0.5">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        */}

        {/* Heatmap */}
        <div className="border-t border-[rgba(0,0,0,0.04)] p-4 sm:p-5">
          <h4 className="text-xs font-semibold text-[#1A1A1A] mb-3">Session Activity</h4>
          {heatmapData.length > 0 ? (
            <Heatmap data={heatmapData} />
          ) : (
            <div className="flex items-center gap-2 py-3">
              <div className="flex gap-[2px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-[22px] h-[22px] rounded-sm bg-[#F0F4F0]" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverviewSection;
