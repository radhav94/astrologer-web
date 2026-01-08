import { useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import PrimaryTabs from "../../../../../components/UI/tabs/PrimaryTabKundli";
import BasicContent from "./BasicContent/BasicContent";
import KundaliContent from "./kundaliContent/KundaliContent";
import KpContent from "./KpContent/KpContent";
import AshtakvargaContent from "./AshtakvargaContent/AshtakvargaContent";
import ChartsContent from "./ChartsContent/ChartsContent";
import DashaContent from "./DashaContent/DashaContent";
import Report from "./FreeKundli/Report";
import Prediction from "./FreeKundli/Prediction";


import { buildVedicParam } from "../../../../../utils/VedicParams.js/vedicParams";
import { useGetKundliByIdQuery, useGetAstroDetailsQuery,useGetPlanetsQuery} from "../../../../../redux/kundli/KundliDetailApi";

const Kundli = () => {
  const { kundliId } = useParams();
  const contentRef = useRef(null);

  // 1️⃣ Fetch base Kundli data
  const { data: kundliData, isLoading: kundliLoading, error: kundliError } = 
    useGetKundliByIdQuery(kundliId ?? skipToken);

  // Wait for data before using
  const astroDetails = kundliData?.data;
  console.log("kundliData from base API:", astroDetails);
  // Only build params if astroDetails exists
  const paramsdata = useMemo(() => {
    if (!astroDetails) return null;
  
    return {
      day: Number(astroDetails.day),
      month: Number(astroDetails.month),
      year: Number(astroDetails.year),
      hour: Number(astroDetails.hour),
      min: Number(astroDetails.min),
      second: Number(astroDetails.second ?? 0),
      lat: Number(astroDetails.lat),   // IMPORTANT: convert string → number
      lon: Number(astroDetails.lon),   // IMPORTANT: convert string → number
      tzone: Number(astroDetails.tzone ?? 5.5),
      lang: "en",
    };
  }, [astroDetails]);
  const params = buildVedicParam(paramsdata);
  const { data: extendedKundli, isLoading: astroLoading, error: astroError } = useGetAstroDetailsQuery(params ?? skipToken);
  const {
    data: fullData,
    isLoading: planetLoading,
    isSuccess: planetSuccess,
  } = useGetPlanetsQuery(params ? params : skipToken);
  console.log("astroDetails : ",astroDetails);

    const tabsData = [
      {
        label: "Basic",
        content: (
          <BasicContent
            birthDetails={fullData?.response}
            birthPanchang={fullData?.response?.panchang}
            userDetails={astroDetails}
            astroDetails = {extendedKundli?.response}
          />
        ),
      },
      {
        label: "Kundli",
        content: <KundaliContent 
        userDetails={astroDetails}
        />,
      },
      {
        label: "KP",
        content: <KpContent
        userDetails={astroDetails}
        />,
      },
      {
        label: "Ashtakvarga",
        content: <AshtakvargaContent 
        userDetails={astroDetails}
        />,
      },
      {
        label: "Charts",
        content: <ChartsContent 
        userDetails={astroDetails}
        />,
      },
      {
        label: "Dasha",
        content: <DashaContent userDetails={astroDetails}
        />,
      },
      {
        label: "Free Report",
        content: <Report 
        userDetail={astroDetails}
        />,
      },
      {
        label: "12 Months Prediction",
        content: <Prediction params={params} skipToken={skipToken} />,
      },
    ];
    console.log("tabsData : ",tabsData);
  return (
          <PrimaryTabs tabs={tabsData} />
  );
};

export default Kundli;
