import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const ChartSelect = ({
  options = ["Birth Chart"],
  value = "Birth Chart",
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // 🔹 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Selected value */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between
                   bg-gray-100 hover:bg-gray-200
                   px-4 py-3 my-2 rounded-lg text-sm font-medium
                   text-gray-900 transition"
      >
        {value}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 mt-2 w-full
                     bg-white rounded-lg shadow-lg
                     border border-gray-200 z-50"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange?.(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm
                hover:bg-gray-100 transition
                ${opt === value ? "font-semibold text-black" : "text-gray-600"}
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartSelect;
