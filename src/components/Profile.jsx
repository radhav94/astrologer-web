import React from "react";
import { Icons } from "./Icons";
import { Link, useLocation } from "react-router-dom";
import ProfileTab from "../screens/private/Profile/ProfileTab";
import SwitchTabs from "./UI/tabs/SwitchTabs";
import Transactions from "../screens/private/Profile/transactions/Transactions";
import SetAvailability from "../screens/private/Profile/availability/SetAvailability.jsx";
import Support from "../screens/private/Profile/support/Support.jsx";

const Profile = ({ onBack }) => {
  const location = useLocation();
  const receivedString = location.state?.data;
  const userData = JSON.parse(
    localStorage.getItem("shubhtalk_astrologer_details")
  );

  const firstName = userData?.firstName?.trim();
  const lastName = userData?.lastName?.trim();
  const userName = firstName && lastName ? `${firstName} ${lastName}` : "Unknown";
  const tabs = [
    {
      label: "Profile",
      value: "profile",
      component: ProfileTab,
    },
    {
      label: "Transactions",
      value: "transactions",
      component: Transactions,
    },
    {
      label: "Availability",
      value: "availability",
      component: SetAvailability,
    },
    {
      label: "Support",
      value: "support",
      component: Support,
    },
  ];
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
              {userName}
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
        <Link
          to="/withdraw-money"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          Withdraw Money <Icons.ArrowRight size={14} />
        </Link>
      </div>

      {/* Tabs */}
      <SwitchTabs tabs={tabs} defaultTab={receivedString} />
    </div>
  );
};

export default Profile;
