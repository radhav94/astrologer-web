import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import { Link } from "react-router-dom";

const SetAvailability = () => {
  const [isFlexible, setIsFlexible] = useState(true);

  const today = new Date();
  const todaysDate = today.toISOString().split("T")[0];

  const [date, setDate] = useState({
    startDate: todaysDate,
    endDate: todaysDate,
  });

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  /* ================= CALENDAR GENERATOR ================= */

  const generateCalendar = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

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
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const isToday =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      calendar.push({
        day: d,
        today: isToday,
      });
    }

    // Next month fillers
    while (calendar.length < 42) {
      calendar.push({
        day: calendar.length - (startDayIndex + totalDays) + 1,
        next: true,
      });
    }

    return calendar;
  };

  const calendarData = generateCalendar(currentMonth);

  /* ================= DATE HANDLERS ================= */

  const handleToggle = () => setIsFlexible(!isFlexible);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setDate((prev) => ({
      startDate: newStartDate,
      endDate: prev.endDate < newStartDate ? newStartDate : prev.endDate,
    }));
  };

  const handleEndDateChange = (e) => {
    setDate((prev) => ({
      ...prev,
      endDate: e.target.value,
    }));
  };

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={handleToggle}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 ${
            isFlexible ? "border-black" : "border-transparent"
          } text-black`}
        >
          Flexible Date
        </button>
        <button
          onClick={handleToggle}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 ${
            !isFlexible ? "border-black" : "border-transparent"
          } text-gray-400 hover:text-gray-600`}
        >
          Fixed Date
        </button>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
          <input
            type="date"
            value={date.startDate}
            min={todaysDate}
            onChange={handleStartDateChange}
            onClick={(e) => e.target.showPicker?.()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">End Date</label>
          <input
            type="date"
            value={date.endDate}
            min={date.startDate}
            onChange={handleEndDateChange}
            onClick={(e) => e.target.showPicker?.()}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold"
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-white mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
          >
            <Icons.ChevronLeft size={20} />
          </button>

          <h2 className="text-lg font-bold text-gray-900">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
            className="p-2 text-gray-900 hover:bg-gray-50 rounded-full"
          >
            <Icons.ArrowRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 mb-2">
          {days.map((d) => (
            <div
              key={d}
              className="text-center text-sm font-bold text-gray-800"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2">
          {calendarData.map((item, idx) => (
            <div key={idx} className="flex justify-center items-center">
              <button
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-all
                  ${item.today ? "bg-black text-white font-bold" : ""}
                  ${item.prev || item.next ? "text-gray-200" : ""}
                  ${
                    !item.prev && !item.next && !item.today
                      ? "text-black font-medium hover:bg-gray-100"
                      : ""
                  }
                `}
              >
                {item.day}
              </button>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/schedule-availablity"
        state={{ data: date }}
        className="w-full bg-black text-white font-medium py-4 rounded-2xl hover:bg-gray-900 transition-colors"
      >
        <p className="text-center">Next</p>
      </Link>
    </div>
  );
};

export default SetAvailability;
