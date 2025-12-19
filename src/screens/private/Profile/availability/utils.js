const to24Hour = (time) => {
  if (!time.includes("AM") && !time.includes("PM")) {
    return time.slice(0, 5);
  }

  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const isDuplicateSlot = (slots, startTime, endTime) => {
  const start24 = to24Hour(startTime);
  const end24 = to24Hour(endTime);

  return slots.some(
    (slot) => to24Hour(slot.start) === start24 && to24Hour(slot.end) === end24
  );
};
export const formatToAmPm = (time24) => {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${hour12.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")} ${period}`;
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);

  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear().toString().slice(-2);

  return `${day} ${month}\` ${year}`;
};
