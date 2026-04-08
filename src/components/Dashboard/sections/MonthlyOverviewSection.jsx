import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icons } from "../../Icons";
import { DonutChart, Heatmap } from "../../Charts";
import SectionHeader from "../../UI/SectionHeader";
import useClickOutside from "../../../hooks/useClickOutside";

/**
 * Monthly Overview Section Component
 * Uses overviewOptions (Today / Yesterday / Last 7 Days / Last 30 Days / Custom)
 * instead of the old MONTHS-based picker.
 */
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

  /** Select a filter option */
  const handleOptionSelect = useCallback((option) => {
    setSelectedOverviewOption(option);
    setIsDropdownOpen(false);
    if (option.value === "custom") {
      // Open the date picker popover
      setIsDatePickerOpen(true);
    } else {
      setCustomFromDate(null);
      setCustomToDate(null);
      setIsDatePickerOpen(false);
    }
  }, [setSelectedOverviewOption, setCustomFromDate, setCustomToDate]);

  /** Handle range selection — auto-close when both dates are picked */
  const handleDateRangeChange = useCallback((dates) => {
    const [start, end] = dates;
    setCustomFromDate(start);
    setCustomToDate(end);
    if (start && end) {
      setIsDatePickerOpen(false);
    }
  }, [setCustomFromDate, setCustomToDate]);

  const isCustom = selectedOverviewOption?.value === "custom";

  /** Format custom date range for button label */
  const getButtonLabel = () => {
    if (isMonthlyLoading) return "Loading...";
    if (isCustom && customFromDate && customToDate) {
      const fmt = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      return `${fmt(customFromDate)} – ${fmt(customToDate)}`;
    }
    return selectedOverviewOption?.label || "Select";
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-4 lg:space-y-6">
        {/* Header + Filter Dropdown */}
        <div className="flex items-center justify-between">
          <SectionHeader title={overviewTitle || "OVERVIEW"} />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                // Always toggle the dropdown — date picker is independent
                setIsDropdownOpen((prev) => !prev);
                setIsDatePickerOpen(false);
              }}
              className="bg-white border border-[#D1D5DB] px-4 py-2 rounded-full text-sm font-normal text-[#FF6B35] flex items-center gap-2 ml-4 cursor-pointer hover:bg-[#FFF8F0] transition-colors"
            >
              {getButtonLabel()}
              <Icons.ChevronDown
                size={16}
                className={`text-[#FF6B35] transition-transform ${(isDropdownOpen || isDatePickerOpen) ? "rotate-180" : ""}`}
              />
            </button>

            {/* Options dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 z-30 overflow-hidden">
                <div className="py-1">
                  {(overviewOptions || []).map((option) => {
                    const isSelected = selectedOverviewOption?.id === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleOptionSelect(option)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                          ${isSelected
                            ? "bg-[#FFF3ED] text-[#FF6B35]"
                            : "text-gray-700 hover:bg-[#FFF8F0]"
                          }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Date picker popover — floats below button when Custom Date is active */}
            {isDatePickerOpen && isCustom && (
              <div
                ref={datePickerRef}
                className="absolute right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-30 p-3"
              >
                <DatePicker
                  selected={customFromDate}
                  onChange={handleDateRangeChange}
                  startDate={customFromDate}
                  endDate={customToDate}
                  selectsRange
                  inline
                  maxDate={new Date()}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-[#FFF8F0] rounded-[1rem] p-2 sm:p-2 shadow-sm border border-[#F0E5D8]">
          <div className="space-y-3 sm:space-y-4">
            {/* TOP ROW: Earnings and Key Metrics Chart */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Earnings */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFA726] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-base sm:text-xl font-bold">₹</span>
                  </div>
                  <p className="text-[#9E9E9E] text-[10px] sm:text-sm font-normal leading-tight">
                    Earnings
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

            {/* MIDDLE: Key Metrics Icons */}
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

            {/* BOTTOM: Sessions Heatmap */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
              <h4 className="text-[10px] sm:text-sm font-normal text-[#9E9E9E] mb-3 sm:mb-4">
                Sessions
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
    </div>
  );
};

export default MonthlyOverviewSection;