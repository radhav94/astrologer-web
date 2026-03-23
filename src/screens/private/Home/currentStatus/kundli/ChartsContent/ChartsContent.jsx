import React from "react";
import NorthIndian from "./NorthIndian";
import SouthIndian from "./SouthIndian";
import styles from "./ChartsContent.module.scss";
import EmptyState from "../../../../../../components/UI/EmptyState";
// import SwitchTabs from "../../../../component/UI/tabs/switchtabs/SwitchTabs";
import { useSelector } from "react-redux";
// import { useGetChartQuery } from "../../../../redux/api/kundli/kundliApi";

const ChartsContent = (props) => {
  const {userDetails } = props || {};

  // Show empty state when required data is not available
  if (!userDetails) return <EmptyState message="No chart data available." />;

  const tabs = [
    { label: "North Indian", value: "north", component: () => <NorthIndian userDetails={userDetails} /> },
    { label: "South Indian", value: "south", component: () => <SouthIndian userDetails={userDetails} /> },
  ];

  return (
    <div className={styles.mainContainer}>
      {/* <SwitchTabs tabs={tabs} defaultTab="north" /> */}
      <NorthIndian userDetails={userDetails} />
    </div>
  );
};

export default ChartsContent;
