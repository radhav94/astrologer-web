import { useState } from "react";

const Tabs = ({ tabs = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabWidth = 100 / tabs.length;

  return (
    <div className="w-full">
      {/* TAB HEADER */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(index)}
            style={{ width: `${tabWidth}%` }}
            className={`py-3 text-sm md:text-base font-medium transition-all
              ${
                activeIndex === index
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-black"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="py-6">{tabs[activeIndex]?.component}</div>
    </div>
  );
};

export default Tabs;
