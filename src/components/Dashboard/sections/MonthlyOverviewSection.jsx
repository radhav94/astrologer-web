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
      {/* Header + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SectionHeader title={overviewTitle || "OVERVIEW"} />
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => { setIsDropdownOpen((p) => !p); setIsDatePickerOpen(false); }}
            className="w-full sm:w-auto bg-white border border-[rgba(0,0,0,0.08)] px-3.5 py-2 rounded-full text-xs font-semibold text-[#F75801] flex items-center justify-between gap-2 cursor-pointer hover:bg-[#FFF5EC] transition-all"
          >
            {getButtonLabel()}
            <Icons.ChevronDown size={13} className={`text-[#F75801] transition-transform duration-200 ${(isDropdownOpen || isDatePickerOpen) ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-1.5 sm:w-40 bg-white rounded-xl shadow-2xl border border-[rgba(0,0,0,0.08)] z-30 overflow-hidden">
              {(overviewOptions || []).map((option) => (
                <button key={option.id} onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-all ${selectedOverviewOption?.id === option.id ? "bg-[#FFF0E4] text-[#F75801]" : "text-[#6B7280] hover:bg-[#f8f9fa] hover:text-[#1A1A1A]"}`}
                >{option.label}</button>
              ))}
            </div>
          )}

          {isDatePickerOpen && isCustom && (
            <div ref={datePickerRef} className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 z-30 p-2 max-w-[calc(100vw-2rem)] overflow-x-auto">
              <DatePicker selected={customFromDate} onChange={handleDateRangeChange} startDate={customFromDate} endDate={customToDate} selectsRange inline maxDate={new Date()} />
            </div>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Top: Earnings hero + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
          {/* Earnings */}
          <div className="p-5 sm:p-6" style={{ background: "linear-gradient(135deg, #FFF5EC 0%, #FFF0E4 100%)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F75801] to-[#FF8F00] flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">₹</span>
              </div>
              <div>
                <p className="text-[11px] text-[#6B7280] font-medium">Total Earnings</p>
                <p className="text-[10px] text-[#9CA3AF]">{isCustom ? "Custom range" : selectedOverviewOption?.label}</p>
              </div>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              {isMonthlyLoading ? <span className="inline-block w-24 h-8 bg-black/5 rounded-lg animate-pulse" /> : formatCurrency()}
            </h3>

            {/* Category breakdown bars */}
            {!isMonthlyLoading && categoryPercentages.length > 0 && (
              <div className="mt-4 space-y-2">
                {categoryPercentages.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#6B7280] w-10">{cat.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-black/[0.04] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.percentage}%`, background: metricsData[idx]?.fill || "#9CA3AF" }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#1A1A1A] w-8 text-right">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donut chart */}
          <div className="p-5 sm:p-6 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-[rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-semibold text-[#6B7280] mb-3">Income Split</p>
            {isMonthlyLoading ? (
              <div className="flex items-center justify-center h-28 text-[#9CA3AF] text-xs">Loading...</div>
            ) : metricsData.length > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <DonutChart data={metricsData} />
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {categoryPercentages.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: metricsData[idx]?.fill }} />
                      <span className="text-[#6B7280]">{item.label}</span>
                      <span className="font-bold text-[#1A1A1A]">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-28 text-[#9CA3AF] text-xs">No data for this period</div>
            )}
          </div>
        </div>

        {/* Metrics strip */}
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

        {/* Heatmap — only show for multi-day ranges */}
        {heatmapData.length >= 3 && (
          <div className="border-t border-[rgba(0,0,0,0.04)] p-4 sm:p-5">
            <h4 className="text-xs font-semibold text-[#1A1A1A] mb-3">Session Activity</h4>
            <Heatmap data={heatmapData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyOverviewSection;
