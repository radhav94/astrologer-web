import React from "react";
import NestedTabs from "../../../../../../components/UI/tabs/nestedtabs/NestedTabs";
import { useSelector } from "react-redux";
import General from "./generalWrapper/general/General";
import Planetary from "./generalWrapper/planetary/Planetary";
import Vimshottari from "./generalWrapper/vimshottari/Vimshottari";
import Yoga from "./generalWrapper/yoga/Yoga";
import FreeReport from "../FreeReportContent/FreeReportContent";
import Rudraksha from "./remedies/rudraksha/Rudraksha";
import GemStones from "./remedies/gemstones/GemStones";
import { PrimaryText } from "../../../../../../components";
import { appColors } from "../../../../../../utils/theme";

const Report = (props) => {
  const {userDetail,birthDetail } = props || {};
  // const userDetails = useSelector((state) => state?.form?.userDetails);
  // const birthDetails = useSelector((state) => state?.form?.kundliPayload);
  const userDetails =userDetail;
  const birthDetails = userDetail;

  const tabs = [
    {
      label: "General",
      value: "general",
      children: [
        // {
        //   label: "General Info",
        //   value: "generalInfo",
        //   component: () => <General />,
        // },
        {
          label: "Planetary",
          value: "planetary",
          component: () => <Planetary userDetails={userDetails}/>,
        },
        {
          label: "Vimshottari",
          value: "vimshottari",
          component: () => <Vimshottari userDetails={userDetails}/>,
        },
        {
          label: "Yoga",
          value: "yoga",
          component: () => <Yoga userDetails={userDetails}/>,
        },
      ],
    },

    {
      label: "Remedies",
      value: "remedies",
      children: [
        {
          label: "Rudraksha",
          value: "rudraksha",
          component: () => <Rudraksha userDetails={userDetails} />,
        },
        {
          label: "Gem Stones",
          value: "gemstones",
          component: () => <GemStones userDetails={userDetails} />,
        },
      ],
    },

    {
      label: "Dosha",
      value: "dosha",
      component: () => <FreeReport userDetails={userDetails}/>,
    },
  ];

  return (
    <div>
      {/* 🔥 Show Name + DOB same as BasicContent UI */}
      <div className="flex mb-4">
        <PrimaryText isSemiBold size_20 color={appColors.tri}>
          {userDetails?.name?.charAt(0).toUpperCase() +
            userDetails?.name?.slice(1)}
        </PrimaryText>

        <div className="mx-2" />

        <PrimaryText isSemiBold size_20 color={appColors.tri}>
          ({birthDetails?.day} - {birthDetails?.month} - {birthDetails?.year})
        </PrimaryText>
      </div>

      <NestedTabs tabs={tabs} />
    </div>
  );
};

export default Report;
