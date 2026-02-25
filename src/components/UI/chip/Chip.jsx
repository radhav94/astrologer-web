const Chip = ({ label, selected, onClick, icon }) => {
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

export default Chip;