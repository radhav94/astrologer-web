import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { SectionHeader } from "../../../../Profile/profile/ui";
import { useGetMahaDashaPredictionsQuery } from "../../../../../../redux/kundli/kundliApi";

const Vimshottari = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 10, 10)); // Months are 0-indexed

  const { data } = useGetMahaDashaPredictionsQuery();
  const dashaData = data?.response?.dashas || [];

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateValue = (date) => {
    // Format to YYYY-MM-DD for input value, ensuring local time usage
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    if (e.target.value) {
      // Create date object treating input as local time
      const [y, m, d] = e.target.value.split("-").map();
      setSelectedDate(new Date(y, m - 1, d));
    }
  };

  // Helper to calculate mock date ranges for the display
  const getDateOffset = (date, years, months = 0) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    newDate.setMonth(newDate.getMonth() + months);
    return formatDateDisplay(newDate);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full  space-y-8">
          {/* Date Selector Header */}
          <div className="relative w-full group">
            <div className="w-[70%] m-auto bg-white border-2 border-gray-900 rounded-2xl p-5 flex items-center justify-between shadow-sm group-hover:bg-gray-50 transition-all duration-200 cursor-pointer pointer-events-none">
              <span className="font-bold text-gray-900 text-lg group-hover:text-gray-700">
                {formatDateDisplay(selectedDate)}
              </span>
              <Calendar className="text-gray-900" size={24} />
            </div>

            {/* Hidden Native Date Input Overlay */}
            <input
              type="date"
              value={formatDateValue(selectedDate)}
              onChange={handleDateChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Select Date"
            />
          </div>

          {/* Main Carousel Section */}
          <div className="flex items-center lg:gap-6">
            {/* Previous Button */}
            <button className="p-0 lg:p-4  bg-gray-100 rounded-2xl hover:bg-gray-200 hover:scale-105 transition-all text-gray-600 shadow-sm flex-shrink-0">
              <ChevronLeft size={28} />
            </button>

            {/* Dasha Card */}
            <div className="flex-1  bg-gray-200/50 backdrop-blur-sm rounded-3xl p-8 shadow-inner border border-gray-200">
              <div className="flex flex-col space-y-6">
                {dashaData.map((dasha, index) => (
                  <div
                    key={index}
                    className="text-center border-b border-gray-300/60 relative"
                  >
                    {/* Date Range */}
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                      {new Date(dasha.dasha_start_year).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(dasha.dasha_end_year).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>

                    {/* Dasha Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {dasha.dasha} Mahadasha
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button className="p-0 lg:p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 hover:scale-105 transition-all text-gray-600 shadow-sm flex-shrink-0">
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Navigate to see past and future planetary periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vimshottari;
