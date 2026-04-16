import { useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icons } from "../../Icons";
import useClickOutside from "../../../hooks/useClickOutside";

const DashboardDateFilter = ({
  options,
  selected,
  onSelect,
  customFromDate,
  customToDate,
  onCustomFromDate,
  onCustomToDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const closeDatePicker = useCallback(() => setIsDatePickerOpen(false), []);
  const dropdownRef = useClickOutside(closeDropdown, isOpen);
  const datePickerRef = useClickOutside(closeDatePicker, isDatePickerOpen);

  const isCustom = selected?.value === "custom";

  const handleSelect = useCallback((option) => {
    onSelect(option);
    setIsOpen(false);
    if (option.value === "custom") {
      setIsDatePickerOpen(true);
    } else {
      onCustomFromDate(null);
      onCustomToDate(null);
      setIsDatePickerOpen(false);
    }
  }, [onSelect, onCustomFromDate, onCustomToDate]);

  const handleDateChange = useCallback((dates) => {
    const [start, end] = dates;
    onCustomFromDate(start);
    onCustomToDate(end);
    if (start && end) setIsDatePickerOpen(false);
  }, [onCustomFromDate, onCustomToDate]);

  const getLabel = () => {
    if (isCustom && customFromDate && customToDate) {
      const fmt = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      return `${fmt(customFromDate)} – ${fmt(customToDate)}`;
    }
    if (isCustom) return "Pick range";
    return selected?.label || "Select";
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-[#1A1A1A]">Dashboard</h2>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => { setIsOpen((p) => !p); setIsDatePickerOpen(false); }}
          className="bg-white border border-[rgba(0,0,0,0.08)] px-4 py-2 rounded-full text-xs font-semibold text-[#F75801] flex items-center gap-2 cursor-pointer hover:bg-[#FFF5EC] transition-all"
        >
          <Icons.Calendar size={13} className="text-[#F75801]" />
          {getLabel()}
          <Icons.ChevronDown size={13} className={`text-[#F75801] transition-transform duration-200 ${(isOpen || isDatePickerOpen) ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-[rgba(0,0,0,0.08)] z-30 overflow-hidden">
            {(options || []).map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-all ${selected?.id === option.id ? "bg-[#FFF0E4] text-[#F75801]" : "text-[#6B7280] hover:bg-[#f8f9fa] hover:text-[#1A1A1A]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {isDatePickerOpen && isCustom && (
          <div ref={datePickerRef} className="absolute right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 z-30 p-2">
            <DatePicker selected={customFromDate} onChange={handleDateChange} startDate={customFromDate} endDate={customToDate} selectsRange inline maxDate={new Date()} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDateFilter;
