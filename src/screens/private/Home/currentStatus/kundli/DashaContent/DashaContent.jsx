import React from "react";
import styles from "./DashaContent.module.scss";
// import SwitchTabs from "../../../../component/UI/tabs/switchtabs/SwitchTabs";
import Vimshottari from "./Vimshottari";
import Yogini from "./Yogini";
import EmptyState from "../../../../../../components/UI/EmptyState";

const DashaContent = (props) => {
  const {userDetails } = props || {};

  // Show empty state when required data is not available
  if (!userDetails) return <EmptyState message="No dasha data available." />;

  const tabs = [
    {
      label: "Vimshottari",
      value: "vimshottari",
      component: () => <Vimshottari userDetails={userDetails}/>,
    },
    {
      label: "Yogini",
      value: "yogini",
      component: () => <Yogini userDetails={userDetails}/>,
    },
  ];

  return (
    <div className={styles.mainContainer}>
      {/* <SwitchTabs tabs={tabs} defaultTab="vimshottari" /> */}
      <Vimshottari  userDetails={userDetails}/>
    </div>
  );
};

export default DashaContent;
