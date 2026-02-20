const Toggle = ({ label, checked, onChange }) => {
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

export default Toggle