import React from "react";
import styles from "./SectionHeader.module.scss";
import { appSvgs } from "../../utils/appImages";

const SectionHeader = ({ title }) => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{title}</h2>
      
      <div className={styles.divider}>
        <img src={appSvgs.LeftLine} alt="" className={styles.line} />
        <img src={appSvgs.Moon} alt="" className={styles.moon} />
        <img src={appSvgs.RightLine} alt="" className={styles.line} />
      </div>
    </div>
  );
};

export default SectionHeader;
