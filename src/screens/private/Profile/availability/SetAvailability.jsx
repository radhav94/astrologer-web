import { useState, useCallback, useEffect } from "react";
import { Icons } from "../../../../components/Icons";
import { Clock, ChevronUp, ChevronDown, Info } from "lucide-react";
import { useUpdateAvailabilityMutation, useGetAstrologerByIdQuery } from "../../../../redux/astrologer/astrologerApi";
import { Toast } from "../../../../components";
import SectionHeader from "../../../../components/UI/SectionHeader";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "19:00";

const formatTime12 = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
};

const getInitialSchedule = (availability = []) => {
  const scheduleFromApi = {};
  availability.forEach((item) => {
    const slot = item.slots?.[0];
    scheduleFromApi[item.day] = {
      enabled: true,
      start: slot?.start || DEFAULT_START,
      end: slot?.end || DEFAULT_END,
    };
  });

  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = scheduleFromApi[day.key] || {
      enabled: false,
      start: DEFAULT_START,
      end: DEFAULT_END,
    };
    return acc;
  }, {});
};

const SetAvailability = () => {
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );
  const astrologerId = userData?._id;
  const { data: astrologerData } = useGetAstrologerByIdQuery(astrologerId, {
    skip: !astrologerId,
  });

  const [schedule, setSchedule] = useState(() => getInitialSchedule());
  const [isScheduleOpen, setIsScheduleOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateAvailability, { isLoading }] = useUpdateAvailabilityMutation();

  // Sync schedule when API data loads
  useEffect(() => {
    const availability = astrologerData?.data?.availability;
    if (availability?.length) {
      setSchedule(getInitialSchedule(availability));
    }
  }, [astrologerData]);

  const toggleDay = useCallback((dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled },
    }));
  }, []);

  const updateTime = useCallback((dayKey, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  }, []);

  // Current online status
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun, 1=Mon, ...
  const currentDayKey = DAYS_OF_WEEK[jsDay === 0 ? 6 : jsDay - 1]?.key;
  const todaySchedule = schedule[currentDayKey];

  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const isCurrentlyOnline =
    todaySchedule?.enabled &&
    currentTime >= todaySchedule.start &&
    currentTime <= todaySchedule.end;
  const offlineTime = todaySchedule?.enabled
    ? formatTime12(todaySchedule.end)
    : null;

  const handleSave = useCallback(async () => {
    try {
      const enabledDays = DAYS_OF_WEEK.filter((d) => schedule[d.key].enabled);
      if (enabledDays.length === 0) {
        Toast.warning("Please enable at least one day");
        return;
      }

      const payload = enabledDays.map((d) => ({
        day: d.key,
        slots: [
          {
            start: schedule[d.key].start,
            end: schedule[d.key].end,
            timezone: "IST",
          },
        ],
      }));

      await updateAvailability(payload).unwrap();
      Toast.success("Availability updated successfully");
      setIsEditing(false);
    } catch (error) {
      Toast.error(error?.data?.message || "Failed to update availability");
    }
  }, [schedule, updateAvailability]);

  return (
    <div className="pt-4 pb-6 px-1">
      {/* ===== BUSINESS HOURS INFO CARD ===== */}
      <div
        className="rounded-2xl px-5 py-5 mb-8"
        style={{ backgroundColor: "#FFF8F0", border: "1px solid #FFE8C5" }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#F75801" }}
          >
            <Info size={14} className="text-white" />
          </div>
          <h3
            className="text-[15px] font-extrabold tracking-wide"
            style={{ color: "#1A1A1A" }}
          >
            BUSINESS HOURS
          </h3>
        </div>
        <p className="text-[13px] leading-[1.6] ml-[34px]" style={{ color: "#6B7280" }}>
          Set your availability for consultations. Clients
          will only be able to book during these hours.
        </p>
      </div>

      {/* ===== WEEKLY SCHEDULE HEADING ===== */}
      <div className="mb-5">
        <SectionHeader title="Weekly Schedule" />
      </div>

      {/* ===== SCHEDULE CARD (collapsible) ===== */}
      <div
        className="rounded-2xl overflow-hidden mb-8"
        style={{ border: "1px solid #E5E7EB" }}
      >
        {/* Online status toggle bar */}
        <button
          onClick={() => setIsScheduleOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-white"
          style={{ borderBottom: isScheduleOpen ? "1px solid #F3F4F6" : "none" }}
        >
          <div className="flex items-center gap-2.5">
            <Clock size={18} style={{ color: "#9CA3AF" }} />
            {isCurrentlyOnline ? (
              <span className="text-[14px]">
                <span className="font-semibold" style={{ color: "#16A34A" }}>
                  Online
                </span>
                <span style={{ color: "#9CA3AF" }}> • Offline {offlineTime}</span>
              </span>
            ) : (
              <span className="text-[14px] font-medium" style={{ color: "#9CA3AF" }}>
                Offline
              </span>
            )}
          </div>
          {isScheduleOpen ? (
            <ChevronUp size={22} style={{ color: "#F75801" }} />
          ) : (
            <ChevronDown size={22} style={{ color: "#F75801" }} />
          )}
        </button>

        {/* Day-wise schedule list */}
        {isScheduleOpen && (
          <div className="px-5 py-4 bg-white space-y-3">
            {DAYS_OF_WEEK.map((day, idx) => {
              const s = schedule[day.key];
              const isFirst = idx === 0;
              return (
                <div
                  key={day.key}
                  className="flex items-center justify-between"
                >
                  <span
                    className="text-[14px]"
                    style={{
                      color: s.enabled ? "#1A1A1A" : "#9CA3AF",
                      fontWeight: isFirst && s.enabled ? 700 : s.enabled ? 500 : 400,
                    }}
                  >
                    {day.label} :
                  </span>
                  <span
                    className="text-[14px]"
                    style={{
                      color: s.enabled ? "#1A1A1A" : "#9CA3AF",
                      fontWeight: isFirst && s.enabled ? 700 : s.enabled ? 500 : 400,
                      fontStyle: s.enabled ? "normal" : "italic",
                    }}
                  >
                    {s.enabled
                      ? `${formatTime12(s.start)} – ${formatTime12(s.end)}`
                      : "Offline"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== EDIT MODE / BUTTON ===== */}
      {isEditing ? (
        <>
          <div className="space-y-4 mb-8">
            {DAYS_OF_WEEK.map((day) => {
              const s = schedule[day.key];
              return (
                <div
                  key={day.key}
                  className="rounded-2xl px-5 py-4 bg-white"
                  style={{ border: "1px solid #F3F4F6" }}
                >
                  {/* Day name + toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className="text-[15px] font-semibold block"
                        style={{ color: "#1A1A1A" }}
                      >
                        {day.label}
                      </span>
                      {!s.enabled && (
                        <span className="text-[12px] flex items-center gap-1 mt-0.5" style={{ color: "#9CA3AF" }}>
                          <Clock size={12} /> Offline
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleDay(day.key)}
                      className="relative rounded-full transition-colors"
                      style={{
                        width: 44,
                        height: 24,
                        backgroundColor: s.enabled ? "#F75801" : "#D1D5DB",
                      }}
                      aria-label={`Toggle ${day.label}`}
                    >
                      <span
                        className="absolute top-[2px] rounded-full bg-white shadow-sm transition-transform"
                        style={{
                          width: 20,
                          height: 20,
                          transform: s.enabled ? "translateX(0px)" : "translateX(-20px)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Time pickers */}
                  {s.enabled && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 relative">
                        <input
                          type="time"
                          value={s.start}
                          onChange={(e) => updateTime(day.key, "start", e.target.value)}
                          onClick={(e) => e.target.showPicker?.()}
                          className="w-full rounded-xl px-3 py-2.5 text-[13px] pr-9 focus:outline-none"
                          style={{ border: "1px solid #E5E7EB", color: "#1A1A1A" }}
                        />
                        <Clock
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "#F75801" }}
                        />
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: "#9CA3AF" }}>To</span>
                      <div className="flex-1 relative">
                        <input
                          type="time"
                          value={s.end}
                          onChange={(e) => updateTime(day.key, "end", e.target.value)}
                          onClick={(e) => e.target.showPicker?.()}
                          className="w-full rounded-xl px-3 py-2.5 text-[13px] pr-9 focus:outline-none"
                          style={{ border: "1px solid #E5E7EB", color: "#1A1A1A" }}
                        />
                        <Clock
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "#F75801" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full text-white font-semibold py-4 rounded-full
                       active:scale-[0.98] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(90deg, #F75801 0%, #D43400 100%)",
              boxShadow: "0 4px 16px rgba(247, 88, 1, 0.3)",
              fontSize: 16,
            }}
          >
            {isLoading ? "Saving..." : (<>Save <Icons.ChevronRight size={18} /></>)}
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-white font-semibold py-4 rounded-full
                     active:scale-[0.98] transition-all
                     flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(90deg, #F75801 0%, #D43400 100%)",
            boxShadow: "0 4px 16px rgba(247, 88, 1, 0.3)",
            fontSize: 16,
          }}
        >
          Edit Availability <Icons.ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default SetAvailability;
