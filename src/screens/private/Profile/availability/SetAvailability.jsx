import { useState, useMemo, useCallback } from "react";
import { Icons } from "../../../../components/Icons";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CALENDAR_ROWS = 42; // 6 weeks

const SetAvailability = () => {
  const [isFlexible, setIsFlexible] = useState(true);
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todaysDate = useMemo(() => today.toISOString().split("T")[0], [today]);

  const [date, setDate] = useState({
    startDate: todaysDate,
    endDate: todaysDate,
  });

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  /* ================= HELPER FUNCTIONS ================= */

  const formatDateForDisplay = useCallback((dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  }, []);

  const formatDateToString = useCallback((dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const isDateInRange = useCallback((checkDate) => {
    if (!date.startDate || !date.endDate) return false;
    
    const start = new Date(date.startDate);
    const end = new Date(date.endDate);
    const check = new Date(checkDate);
    
    // Reset time parts for accurate comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    check.setHours(0, 0, 0, 0);
    
    return check >= start && check <= end;
  }, [date.startDate, date.endDate]);

  /* ================= CALENDAR GENERATOR ================= */

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Monday start
    const totalDays = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const calendar = [];

    // Previous month days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      calendar.push({
        day: prevMonthLastDay - i,
        prev: true,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const currentDate = new Date(year, month, d);
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const isSelected = isDateInRange(currentDate);

      calendar.push({
        day: d,
        today: isToday,
        selected: isSelected,
        date: currentDate,
      });
    }

    // Next month fillers
    let nextDay = 1;
    while (calendar.length < CALENDAR_ROWS) {
      calendar.push({
        day: nextDay,
        next: true,
        date: new Date(year, month + 1, nextDay),
      });
      nextDay++;
    }

    return calendar;
  }, [currentMonth, today, isDateInRange]);

  /* ================= EVENT HANDLERS ================= */

  const handleDateClick = useCallback((dateObj) => {
    if (dateObj.prev || dateObj.next) return;
    
    const clickedDate = formatDateToString(dateObj.date);
    
    if (!isFlexible) {
      // Fixed Date: Always set both start and end to the same date
      setDate({
        startDate: clickedDate,
        endDate: clickedDate,
      });
      setIsSelectingRange(false);
    } else {
      // Flexible Date: Allow range selection
      if (!isSelectingRange) {
        // Start new selection
        setDate({
          startDate: clickedDate,
          endDate: clickedDate,
        });
        setIsSelectingRange(true);
      } else {
        // Complete the range
        if (clickedDate >= date.startDate) {
          setDate(prev => ({ ...prev, endDate: clickedDate }));
        } else {
          setDate({
            startDate: clickedDate,
            endDate: date.startDate,
          });
        }
        setIsSelectingRange(false);
      }
    }
  }, [isFlexible, isSelectingRange, date.startDate, formatDateToString]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen md:min-h-0 md:my-8 md:rounded-2xl md:shadow-sm">
        <div className="px-5 py-6 md:px-8 md:py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/profile"
              state={{ data: "availability" }}
              className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors flex-shrink-0"
            >
              <Icons.ChevronLeft size={20} className="text-[#F75801]" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Availability
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsFlexible(true)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative
                ${isFlexible ? "text-[#F75801]" : "text-gray-400"}`}
            >
              Flexible Date
              {isFlexible && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F75801]" />
              )}
            </button>
            <button
              onClick={() => setIsFlexible(false)}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative
                ${!isFlexible ? "text-[#F75801]" : "text-gray-400"}`}
            >
              Fixed Date
              {!isFlexible && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F75801]" />
              )}
            </button>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="startDate" className="text-sm font-semibold text-gray-900 mb-2 block">
                Start Date
              </label>
              <div className="relative">
                <input
                  id="startDate"
                  type="text"
                  value={formatDateForDisplay(date.startDate)}
                  readOnly
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900
                           focus:outline-none focus:ring-0 focus:border-gray-400 pr-10 bg-white cursor-default"
                />
                <Calendar 
                  size={20} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F75801] pointer-events-none" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="text-sm font-semibold text-gray-900 mb-2 block">
                End Date
              </label>
              <div className="relative">
                <input
                  id="endDate"
                  type="text"
                  value={formatDateForDisplay(date.endDate)}
                  readOnly
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900
                           focus:outline-none focus:ring-0 focus:border-gray-400 pr-10 bg-white cursor-default"
                />
                <Calendar 
                  size={20} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F75801] pointer-events-none" 
                />
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 text-[#F75801] hover:bg-[#FFF5EC] rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <Icons.ChevronLeft size={20} />
              </button>

              <h2 className="text-base font-bold text-gray-900">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <button
                onClick={handleNextMonth}
                className="p-2 text-[#F75801] hover:bg-[#FFF5EC] rounded-lg transition-colors"
                aria-label="Next month"
              >
                <Icons.ChevronRight size={20} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-gray-500"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((item, idx) => (
                <div key={idx} className="flex justify-center items-center">
                  <button
                    onClick={() => handleDateClick(item)}
                    disabled={item.prev || item.next}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                      ${item.selected ? "bg-[#F75801] text-white" : ""}
                      ${item.today && !item.selected ? "border-2 border-[#F75801] text-gray-900" : ""}
                      ${item.prev || item.next ? "text-gray-300 cursor-not-allowed" : ""}
                      ${
                        !item.prev && !item.next && !item.today && !item.selected
                          ? "text-gray-900 hover:bg-gray-100"
                          : ""
                      }
                    `}
                    aria-label={`Select ${item.day}`}
                  >
                    {item.day}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Link
            to="/schedule-availablity"
            state={{ data: date }}
            className="w-full bg-gradient-to-r from-[#F75801] to-[#D43400] text-white font-semibold py-4 rounded-full
                     hover:from-[#E54E00] hover:to-[#C32F00] active:scale-[0.98] transition-all shadow-lg
                     flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SetAvailability;
