const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`w-full bg-gray-950 text-white font-medium py-4 px-6 rounded-xl hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;