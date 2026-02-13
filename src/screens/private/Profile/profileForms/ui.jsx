import { Link } from "react-router-dom";
import { Icons } from "../../../../components/Icons";

export const Toggle = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2
          ${checked ? "bg-gray-900" : "bg-gray-300"}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
};

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`w-full bg-gray-950 text-white font-medium py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Section Header
export const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-8">
      <button
        onClick={() => navigate(-1)}
        className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
      >
        <Icons.ChevronLeft size={20} className="text-gray-700" />
      </button>

      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
);

export const Chip = ({ label, selected, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
        ${
          selected
            ? "bg-gray-800 text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
      `}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};
