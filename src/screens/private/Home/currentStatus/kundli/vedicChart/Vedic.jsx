import styles from "./vedic.module.scss";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetChartQuery } from "../../../../../../redux/kundli/kundliApi";
import Chart from "../../../../../../components/UI/charts/Chart";
import ChartSelect from "../../../../../../components/UI/charts/ChartSelect";

const Vedic = () => {
  /**Birth Chart */
  const {
    data: birthChart,
    isLoading: birthLoading,
    isSuccess: birthSuccess,
  } = useGetChartQuery({ chartType: "D1" });
  console.log("birthChart", birthChart);

  const svgBirthUrl = birthChart
    ? `data:image/svg+xml;utf8,${encodeURIComponent(birthChart)}`
    : null;

  return (
    <div>
      {birthSuccess && (
        <div className={styles.mainContainer}>
          <ChartSelect />
          <div className={styles.grid}>
            {/* D1: Lagna Chart */}
            <Chart src={svgBirthUrl} />
          </div>
          <p className="text-gray-500">
            The D1 or Birth Chart maps planetery position at your birth, showing
            your life's overall blueprint
          </p>
        </div>
      )}
    </div>
  );
};

export default Vedic;
