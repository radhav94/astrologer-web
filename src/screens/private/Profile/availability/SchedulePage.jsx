import { Link, useLocation } from "react-router-dom";
import { Icons } from "../../../../components/Icons";
import { useState } from "react";
import { formatDateShort, formatToAmPm, isDuplicateSlot } from "./utils";
import { Toast } from "../../../../components";
import { useUpdateAvailabilityMutation } from "../../../../redux/astrologer/astrologerApi";

const initialSlots = [{ start: "08:00", end: "09:00", timezone: "IST" }];

const SchedulePage = () => {
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("");
  const [slots, setSlots] = useState(initialSlots);

  const {
    state: { data },
  } = useLocation();

  const [updateAvailability, { isLoading }] = useUpdateAvailabilityMutation();

  const handleSave = async () => {
    try {
      if (!startTime || !endTime) {
        Toast.warning("Please select start and end time");
        return;
      }

      if (isDuplicateSlot(slots, startTime, endTime)) {
        Toast.warning("This time slot already exists");
        return;
      }

      const updatedSlots = [
        {
          start: startTime,
          end: endTime,
          timezone: "IST",
        },
        ...slots,
      ];

      setSlots(updatedSlots);

      const availabilityPayload = [
        {
          startDate: data?.startDate,
          endDate: data?.endDate,
          slots: updatedSlots,
        },
      ];

      await updateAvailability(availabilityPayload).unwrap();
      Toast.success("Availability updated successfully");
    } catch (error) {
      Toast.error(error?.data?.message || "Failed to update availability");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen md:rounded-3xl md:shadow-lg pb-8">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-6">
        <button className="p-2 bg-gray-100 rounded-xl">
          <Link to="/profile" state={{ data: "availability" }}>
            <Icons.ChevronLeft size={20} />
          </Link>
        </button>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="bg-gray-200 px-3 py-1.5 rounded-md">
            {formatDateShort(data?.startDate)}
          </span>
          <span className="text-gray-400 text-xs">to</span>
          <span className="bg-gray-200 px-3 py-1.5 rounded-md">
            {formatDateShort(data?.endDate)}
          </span>
        </div>
      </header>

      <div className="px-5">
        {/* Add Slot */}
        <div className="bg-gray-100 rounded-2xl p-5 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full border rounded-lg px-3 py-2.5 text-sm font-semibold"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={(e) => e.target.showPicker?.()}
                className="w-full border rounded-lg px-3 py-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-black text-white px-8 py-2 rounded-full"
          >
            Save
          </button>
        </div>

        {/* Slot List */}
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div
              key={`${slot.start}-${slot.end}-${index}`}
              className="bg-gray-200 rounded-xl p-4 flex justify-between"
            >
              <span className="text-sm font-bold">
                {formatToAmPm(slot.start)} - {formatToAmPm(slot.end)}
              </span>

              <span className="text-xs font-semibold text-green-700">
                {slot.timezone}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
