import PrimaryTabs from "../../../../../components/PrimaryButton";
import BasicContent from "./basic/BasicContent";
import { useRef, useEffect } from "react";

import { skipToken } from "@reduxjs/toolkit/query";
import { useGetAstroDetailsQuery } from "../../../../../redux/kundli/kundliApi";
import Tabs from "../../../../../components/UI/tabs/PrimaryTabs";
import Vedic from "./vedicChart/Vedic";
import { ChevronLeft, Mic, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Vimshottari from "./vimshottari/Vimshottari";

const Kundli = () => {
  const contentRef = useRef(null);

  const {
    data,
    isSuccess: isAstro,
    isLoading: astroLoading,
  } = useGetAstroDetailsQuery();
  const astroDetails = data?.response;

  const tabsData = [
    {
      label: "Basic Details",
      component: <BasicContent astroDetails={astroDetails} />,
    },

    {
      label: "Vedic Chart",
      component: <Vedic />,
    },
    {
      label: "Vimshottari Dasha",
      component: <Vimshottari />,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between p-2  border-b border-gray-100 bg-white rounded-t-2xl z-10">
        <div className="flex items-center gap-3">
          <button className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Link to="/call-status">
              <ChevronLeft size={20} className="text-gray-700" />
            </Link>
          </button>
          <div className="pr-14">
            <div className="flex ">
              <h2 className="text-lg font-bold text-gray-900">Priya Gupta</h2>
            </div>
          </div>
        </div>
        <div className="flex items-center ">
          <div className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">
            Ends in 3:11
          </div>
          {/* Placeholder for menu dots if needed like standard chat apps, though not in wireframe explicitly, useful for desktop feel */}
        </div>
      </div>
      {isAstro ? <Tabs tabs={tabsData} /> : "Loading..."}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder="| Starts typing..."
            className="w-full pl-5 pr-12 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm group-hover:border-gray-400"
          />
        </div>

        <button
          className="p-4 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="Voice Message"
        >
          <Mic size={24} />
        </button>

        <button className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 shadow-md transition-transform active:scale-95">
          <Send size={20} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default Kundli;
