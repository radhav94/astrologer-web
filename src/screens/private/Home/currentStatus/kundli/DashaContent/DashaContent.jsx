import React from "react";
import styles from "./DashaContent.module.scss";
// import SwitchTabs from "../../../../component/UI/tabs/switchtabs/SwitchTabs";
import Vimshottari from "./Vimshottari";
import Yogini from "./Yogini";

const DashaContent = (props) => {
  const {userDetails } = props || {};
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
