import { useState, useCallback } from "react";
import { Icons } from "../../Icons";
import { DonutChart, Heatmap } from "../../Charts";
import SectionHeader from "../../UI/SectionHeader";
import useClickOutside from "../../../hooks/useClickOutside";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth() + 1;
const CURRENT_YEAR = NOW.getFullYear();

/**
 * Monthly Overview Section Component
 * Displays monthly earnings, metrics, and session heatmap
 */
const MonthlyOverviewSection = ({ 
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
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);
  const dropdownRef = useClickOutside(closeDropdown, isDropdownOpen);

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex + 1);
    setIsDropdownOpen(false);
  };

  const handleYearChange = (direction) => {
    const newYear = selectedYear + direction;
    if (newYear > CURRENT_YEAR) return;
    setSelectedYear(newYear);
    if (newYear === CURRENT_YEAR && selectedMonth > CURRENT_MONTH) {
      setSelectedMonth(CURRENT_MONTH);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <SectionHeader title="MONTHLY OVERVIEW" />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="bg-white border border-[#D1D5DB] px-4 py-2 rounded-full text-sm font-normal text-[#FF6B35] flex items-center gap-2 ml-4 cursor-pointer hover:bg-[#FFF8F0] transition-colors"
            >
              {isMonthlyLoading ? "Loading..." : monthName}
              <Icons.ChevronDown
                size={16}
                className={`text-[#FF6B35] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 z-30 overflow-hidden">
                {/* Year selector */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-[#FFF8F0]">
                  <button
                    onClick={() => handleYearChange(-1)}
                    className="p-1 hover:bg-white rounded-full transition-colors"
                  >
                    <Icons.ChevronLeft size={16} className="text-[#FF6B35]" />
                  </button>
                  <span className="text-sm font-semibold text-gray-800">{selectedYear}</span>
                  <button
                    onClick={() => handleYearChange(1)}
                    disabled={selectedYear >= CURRENT_YEAR}
                    className="p-1 hover:bg-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Icons.ChevronRight size={16} className="text-[#FF6B35]" />
                  </button>
                </div>

                {/* Month grid */}
                <div className="grid grid-cols-3 gap-1 p-2">
                  {MONTHS.map((m, idx) => {
                    const monthNum = idx + 1;
                    const isSelected = monthNum === selectedMonth;
                    const isFuture = selectedYear === CURRENT_YEAR && monthNum > CURRENT_MONTH;

                    return (
                      <button
                        key={m}
                        onClick={() => !isFuture && handleMonthSelect(idx)}
                        disabled={isFuture}
                        className={`py-2 px-1 rounded-lg text-xs font-medium transition-colors
                          ${isSelected
                            ? "bg-[#FF6B35] text-white"
                            : isFuture
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-[#FFF0E6]"
                          }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#FFF8F0] rounded-[2rem] p-3 sm:p-6 shadow-sm border border-[#F0E5D8]">
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

            {/* BOTTOM: Monthly Sessions Heatmap */}
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
    </div>
  );
};

export default MonthlyOverviewSection;
