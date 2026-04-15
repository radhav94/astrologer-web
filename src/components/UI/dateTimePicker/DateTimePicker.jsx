import { forwardRef, useState, useRef, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./DateTimePicker.module.scss";

/* ── 12-hour helpers ── */
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"];
const pad = (n) => String(n).padStart(2, "0");

const to12Hour = (date) => {
  if (!date) return { hour: 12, minute: 0, period: "AM" };
  const h = date.getHours();
  return {
    hour: h === 0 ? 12 : h > 12 ? h - 12 : h,
    minute: date.getMinutes(),
    period: h >= 12 ? "PM" : "AM",
  };
};

const to24Date = (hour, minute, period, base) => {
  const d = base ? new Date(base) : new Date();
  let h24 = hour;
  if (period === "AM") h24 = hour === 12 ? 0 : hour;
  else h24 = hour === 12 ? 12 : hour + 12;
  d.setHours(h24, minute, 0, 0);
  return d;
};

/**
 * DateTimePicker - Reusable, cross-browser date/time picker
 *
 * @param {string} label - Input label
 * @param {Date|null} selected - Currently selected date
 * @param {Function} onChange - Callback with selected Date object
 * @param {"date"|"time"|"datetime"} mode - Picker mode
 * @param {string} dateFormat - Display format (default: dd/MM/yyyy)
 * @param {string} placeholder - Placeholder text
 * @param {Date} minDate - Minimum selectable date
 * @param {Date} maxDate - Maximum selectable date
 * @param {boolean} disabled - Disable the input
 * @param {string} className - Additional wrapper class
 * @param {boolean} required - Show required indicator
 */
const DateTimePicker = ({
  label,
  selected,
  onChange,
  mode = "date",
  dateFormat,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  className = "",
  required = false,
  // Legacy prop support
  showTime,
}) => {
  // Resolve mode from legacy showTime prop
  const resolvedMode = showTime ? "datetime" : mode;

  const isTimeOnly = resolvedMode === "time";
  const isDateTime = resolvedMode === "datetime";

  // Resolve format based on mode
  const resolvedFormat = dateFormat || (
    isTimeOnly ? "hh:mm aa" : isDateTime ? "dd/MM/yyyy hh:mm aa" : "dd/MM/yyyy"
  );

  const resolvedPlaceholder = placeholder || (
    isTimeOnly ? "Select time" : isDateTime ? "Select date & time" : "Select date"
  );

  /* ── Time-only mode: custom 12-hour dropdown ── */
  if (isTimeOnly) {
    return (
      <TimeOnly12h
        selected={selected}
        onChange={onChange}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        label={label}
        required={required}
        className={className}
      />
    );
  }

  // Custom input for consistent cross-browser rendering
  const CustomInput = forwardRef(({ value, onClick, onChange: onInputChange }, ref) => (
    <input
      ref={ref}
      type="text"
      value={value}
      onClick={onClick}
      onChange={onInputChange}
      placeholder={resolvedPlaceholder}
      disabled={disabled}
      className={styles.input}
      readOnly={false}
      autoComplete="off"
    />
  ));
  CustomInput.displayName = "CustomInput";

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <DatePicker
        selected={selected}
        onChange={onChange}
        // Date options
        {...(!isTimeOnly && {
          showMonthDropdown: true,
          showYearDropdown: true,
          dropdownMode: "select",
          scrollableYearDropdown: true,
          yearDropdownItemNumber: 100,
        })}
        // Time options
        showTimeSelect={isDateTime}
        showTimeSelectOnly={false}
        timeFormat="hh:mm aa"
        timeIntervals={15}
        // Format
        dateFormat={resolvedFormat}
        // Constraints
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        // Custom input for Safari compatibility
        customInput={<CustomInput />}
        // Positioning
        popperPlacement="bottom-start"
        popperClassName={styles.popper}
        calendarClassName={styles.calendar}
        // Accessibility
        autoComplete="off"
      />
    </div>
  );
};

/* ── Internal 12-hour time picker (inline, not a separate file) ── */
const TimeOnly12h = ({ selected, onChange, placeholder, disabled, label, required, className }) => {
  const { hour, minute, period } = to12Hour(selected);
  const [open, setOpen] = useState(false);
  const [selHour, setSelHour] = useState(hour);
  const [selMinute, setSelMinute] = useState(minute);
  const [selPeriod, setSelPeriod] = useState(period);
  const wrapperRef = useRef(null);
  const hourColRef = useRef(null);
  const minuteColRef = useRef(null);

  // Sync when selected prop changes externally
  useEffect(() => {
    const { hour: h, minute: m, period: p } = to12Hour(selected);
    setSelHour(h);
    setSelMinute(m);
    setSelPeriod(p);
  }, [selected]);

  const emitChange = useCallback(
    (h, m, p) => { if (onChange) onChange(to24Date(h, m, p, selected)); },
    [onChange, selected]
  );

  const pickHour = (h) => { setSelHour(h); emitChange(h, selMinute, selPeriod); };
  const pickMinute = (m) => { setSelMinute(m); emitChange(selHour, m, selPeriod); };
  const pickPeriod = (p) => { setSelPeriod(p); emitChange(selHour, selMinute, p); };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll selected items into view when dropdown opens
  useEffect(() => {
    if (!open) return;
    const ITEM_H = 36;
    const scrollInto = (ref, idx) => {
      if (ref.current) {
        ref.current.scrollTop = idx * ITEM_H - ref.current.clientHeight / 2 + ITEM_H / 2;
      }
    };
    requestAnimationFrame(() => {
      scrollInto(hourColRef, selHour - 1);
      scrollInto(minuteColRef, selMinute);
    });
  }, [open, selHour, selMinute]);

  const displayValue = selected ? `${pad(selHour)}:${pad(selMinute)} ${selPeriod}` : "";

  return (
    <div className={`${styles.wrapper} ${className || ""}`} ref={wrapperRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type="text"
        readOnly
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.input}
        onClick={() => !disabled && setOpen((v) => !v)}
        autoComplete="off"
      />
      {open && (
        <div className={styles.timeDropdown}>
          <div className={styles.timeColumn} ref={hourColRef}>
            {HOURS.map((h) => (
              <div
                key={h}
                className={`${styles.timeItem} ${h === selHour ? styles.timeItemSelected : ""}`}
                onClick={() => pickHour(h)}
              >
                {pad(h)}
              </div>
            ))}
          </div>
          <div className={styles.timeColumn} ref={minuteColRef}>
            {MINUTES.map((m) => (
              <div
                key={m}
                className={`${styles.timeItem} ${m === selMinute ? styles.timeItemSelected : ""}`}
                onClick={() => pickMinute(m)}
              >
                {pad(m)}
              </div>
            ))}
          </div>
          <div className={styles.timeColumn}>
            {PERIODS.map((p) => (
              <div
                key={p}
                className={`${styles.timeItem} ${p === selPeriod ? styles.timeItemSelected : ""}`}
                onClick={() => pickPeriod(p)}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
