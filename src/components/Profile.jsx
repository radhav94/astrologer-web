import React from "react";
import { Icons } from "./Icons";
import { Link } from "react-router-dom";

const Profile = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Link to="/">
              <Icons.ChevronLeft size={20} className="text-gray-700" />
            </Link>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none">
              Hari Prasad
            </h1>
            <p className="text-xs text-gray-500 mt-1">🕉️ Exp. 20 Yrs</p>
          </div>
        </div>
        <div className="bg-[#56AB81] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          Verified
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-[#EAEAEA] rounded-2xl p-6 mb-8 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Icons.Wallet size={14} /> Balance
          </div>
          <h2 className="text-4xl font-light text-gray-900">₹20K</h2>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
          Withdraw Money <Icons.ArrowRight size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar mb-4">
        {["Profile", "Transactions", "Availability", "Support"].map(
          (tab, idx) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                idx === 0
                  ? "bg-white border-black text-black"
                  : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Details Sections */}
      <div className="space-y-4 pb-12 text-left">
        {/* Basic Details */}
        <div className="bg-[#EAEAEA] p-5 rounded-2xl relative">
          <div className="absolute top-5 right-5 text-gray-500">
            {/* <Icons.Edit size={18} /> */}
          </div>
          <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
            Basic Details
          </span>
          <h3 className="font-bold text-lg text-gray-900 mt-3">Hari Prasad</h3>
          <p className="text-sm text-gray-600">Jan 01, 2002 • Male</p>
          <p className="text-sm text-gray-600">+91 98989 98989</p>
          <p className="text-sm text-gray-600">hariprasad@gmail.com</p>
        </div>

        {/* Languages */}
        <div className="bg-[#EAEAEA] p-5 rounded-2xl relative">
          <div className="absolute top-5 right-5 text-gray-500">
            {/* <Icons.Edit size={18} /> */}
          </div>
          <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
            Languages
          </span>
          <div className="flex gap-2 mt-3">
            <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
              Hindi
            </span>
            <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
              English
            </span>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-[#EAEAEA] p-5 rounded-2xl relative">
          <div className="absolute top-5 right-5 text-gray-500">
            {/* <Icons.Edit size={18} /> */}
          </div>
          <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
            Professional Details
          </span>
          <div className="flex gap-2 mt-3">
            <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
              Vedic
            </span>
            <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
              Tarot
            </span>
            <span className="bg-[#666666] text-white px-4 py-1.5 rounded-full text-sm">
              KP
            </span>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#EAEAEA] p-5 rounded-2xl relative">
          <div className="absolute top-5 right-5 text-gray-500">
            {/* <Icons.Edit size={18} /> */}
          </div>
          <span className="bg-[#444444] text-white px-3 py-1 rounded-full text-xs font-medium">
            Achievements
          </span>
          <p className="text-sm text-gray-700 mt-3 leading-relaxed">
            With years of dedicated practice, I've guided thousands of
            individuals across love, career, health, and life direction. My work
            combines classical Vedic principles with deep intuitive
            understanding, helping clients receive...{" "}
            <span className="text-blue-600 font-medium">Continue Reading</span>
          </p>
          <div className="flex gap-2 mt-4">
            <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg"></div>
            <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg"></div>
            <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg"></div>
            <div className="w-16 h-16 bg-[#C4C4C4] rounded-lg flex items-center justify-center text-gray-600 font-bold text-sm">
              +4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
