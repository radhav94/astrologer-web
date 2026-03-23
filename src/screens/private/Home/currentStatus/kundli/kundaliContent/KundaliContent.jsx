import React from "react";
import { motion } from "framer-motion";
import styles from "./KundaliContent.module.scss";
import { PrimaryText } from "../../../../../../components";
import { appColors } from "../../../../../../utils/theme";
import NorthIndian from "./NorthIndian";
import SouthIndian from "./SouthIndian";
import EmptyState from "../../../../../../components/UI/EmptyState";
// import SwitchTabs from "../../../../components/UI/tabs/switchtabs/SwitchTabs";
import { useSelector } from "react-redux";
// import { useGetPlanetsQuery } from "../../../../redux/api/kundli/kundliApi";
// import { skipToken } from "@reduxjs/toolkit/query";

const KundaliContent = (props) => {
  // const userDetails = useSelector((state) => state?.form?.userDetails);
  const {userDetails } = props || {};
  // Show empty state when required data is not available
  if (!userDetails) return <EmptyState message="No kundali data available." />;
  // const tabs = [
  //   { label: "North Indian", value: "north", component: () => <NorthIndian data={data} /> },
  //   { label: "South Indian", value: "south", component: () => <SouthIndian data={data} /> },
  // ];

  return (
    <div>
      {userDetails && (
        <div className="flex mb-4">
          <PrimaryText isSemiBold size_20 color={appColors.tri}>
            {userDetails?.name || "--"}
          </PrimaryText>
          <div className="mr-2 ml-2" />
          <PrimaryText isSemiBold size_20 color={appColors.tri}>
            ({userDetails?.day || "--"} - {userDetails?.month || "--"} -{" "}
            {userDetails?.year || "--"})
          </PrimaryText>
        </div>
      )}
      <div className={styles.mainContainer}>
        {/* <SwitchTabs tabs={tabs} defaultTab="north" /> */}
        <NorthIndian
          userDetails={userDetails}
        />
      </div>
    </div>
  );
};

export default KundaliContent;
