import { Link, useLocation } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { useState, useCallback, useMemo } from "react";
import { formatToAmPm, isDuplicateSlot } from "./utils";
import { Toast } from "../../../../components";
import { useUpdateAvailabilityMutation } from "../../../../redux/astrologer/astrologerApi";
import { Clock, Calendar, Trash2, ChevronRight } from "lucide-react";

const SchedulePage = () => {
  const { state: { data } } = useLocation();
  
  const [startTime, setStartTime] = useState("11:00");
  const [endTime, setEndTime] = useState("20:00");
  const [slots, setSlots] = useState([]);

  const [updateAvailability, { isLoading }] = useUpdateAvailabilityMutation();

  /* ================= HELPER FUNCTIONS ================= */

  const formatDateDisplay = useCallback((dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month}'${year}`;
  }, []);

  const isSameDate = useMemo(
    () => data?.startDate === data?.endDate,
    [data?.startDate, data?.endDate]
  );

  /* ================= EVENT HANDLERS ================= */

  const handleAddSlot = useCallback(() => {
    if (!startTime || !endTime) {
      Toast.warning("Please select start and end time");
      return;
    }

    if (endTime <= startTime) {
      Toast.warning("End time must be after start time");
      return;
    }

    if (isDuplicateSlot(slots, startTime, endTime)) {
      Toast.warning("This time slot already exists");
      return;
    }

    const newSlot = {
      start: startTime,
      end: endTime,
      timezone: "IST",
      isOnline: true,
    };

    setSlots(prevSlots => [...prevSlots, newSlot]);
    Toast.success("Time slot added");
  }, [startTime, endTime, slots]);

  const handleToggleOnline = useCallback((index) => {
    setSlots(prevSlots => 
      prevSlots.map((slot, i) => 
        i === index ? { ...slot, isOnline: !slot.isOnline } : slot
      )
    );
  }, []);

  const handleDeleteSlot = useCallback((index) => {
    setSlots(prevSlots => prevSlots.filter((_, i) => i !== index));
    Toast.success("Time slot removed");
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (slots.length === 0) {
        Toast.warning("Please add at least one time slot");
        return;
      }

      const availabilityPayload = [
        {
          startDate: data?.startDate,
          endDate: data?.endDate,
          slots: slots,
        },
      ];

      await updateAvailability(availabilityPayload).unwrap();
      Toast.success("Availability updated successfully");
    } catch (error) {
      Toast.error(error?.data?.message || "Failed to update availability");
    }
  }, [slots, data?.startDate, data?.endDate, updateAvailability]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen md:min-h-0 md:my-8 md:rounded-2xl md:shadow-sm">
        <div className="px-5 py-6 md:px-8 md:py-8 flex flex-col min-h-screen md:min-h-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to="/profile"
              state={{ data: "availability" }}
              className="p-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-xl hover:bg-[#FFEDD5] transition-colors flex-shrink-0"
            >
              <Icons.ChevronLeft size={20} className="text-[#F75801]" />
            </Link>
            
            {/* Date Badge */}
            <div className="px-4 py-2 bg-[#FFF5EC] border border-[#FFE8C5] rounded-full">
              <span className="text-sm font-semibold text-gray-900">
                {formatDateDisplay(data?.startDate)}
                {!isSameDate && (
                  <>
                    <span className="text-gray-500 mx-2">to</span>
                    {formatDateDisplay(data?.endDate)}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Time Inputs */}
          <div className="bg-white mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startTime" className="text-base font-semibold text-gray-900 mb-3 block">
                  Start Time
                </label>
                <div className="relative">
                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onClick={(e) => e.target.showPicker?.()}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900
                             focus:outline-none focus:ring-0 focus:border-gray-400 pr-10"
                  />
                  <Clock 
                    size={20} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F75801] pointer-events-none" 
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="text-base font-semibold text-gray-900 mb-3 block">
                  End Time
                </label>
                <div className="relative">
                  <input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onClick={(e) => e.target.showPicker?.()}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900
                             focus:outline-none focus:ring-0 focus:border-gray-400 pr-10"
                  />
                  <Calendar 
                    size={20} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F75801] pointer-events-none" 
                  />
                </div>
              </div>
            </div>
            
            {/* Add Slot Button */}
            <button
              onClick={handleAddSlot}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl
                       hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              Add Time Slot
            </button>
          </div>

          {/* Slot List */}
          <div className="space-y-3 mb-6 flex-1">
            {slots.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No time slots added yet. Add your first slot above.
              </div>
            ) : (
              slots.map((slot, index) => (
                <div
                  key={`${slot.start}-${slot.end}-${index}`}
                  className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center justify-between"
                >
                  <span className="text-base font-semibold text-gray-900">
                    {formatToAmPm(slot.start)} - {formatToAmPm(slot.end)}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Online Toggle */}
                    <button
                      onClick={() => handleToggleOnline(index)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors
                        ${slot.isOnline 
                          ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                          : 'bg-gray-200 text-gray-600'}`}
                      aria-label={`Toggle ${slot.isOnline ? 'offline' : 'online'}`}
                    >
                      {slot.isOnline ? 'Online' : 'Offline'}
                      <div className={`w-2 h-2 rounded-full ${slot.isOnline ? 'bg-[#4CAF50]' : 'bg-gray-400'}`} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteSlot(index)}
                      className="p-2 text-[#EF4444] hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete time slot"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading || slots.length === 0}
            className="w-full bg-gradient-to-r from-[#F75801] to-[#D43400] text-white font-semibold py-4 rounded-full
                     hover:from-[#E54E00] hover:to-[#C32F00] active:scale-[0.98] transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
