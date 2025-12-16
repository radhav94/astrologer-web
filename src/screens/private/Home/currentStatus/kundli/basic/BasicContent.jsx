// src/components/tabs/BasicContent.jsx
import styles from "./BasicContent.module.scss";
import { appColors } from "../../../../../../utils/theme";
import { useSelector } from "react-redux";
import { capitalizeWords } from "../../../../../../utils/capitalize";
import PrimaryText from "../../../../../../components/PrimaryText";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const DetailCard = ({ title, data = {}, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  const formatKeyLabel = (key) => {
    if (!key) return "";
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const entries = Object.entries(data).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  return (
    <div className={styles.detailCard}>
      {/* HEADER */}
      <div className={styles.cardHeader} onClick={() => setOpen((o) => !o)}>
        <h3 className={styles.cardTitle}>{title}</h3>

        <button type="button" className={styles.toggleBtn} aria-label="Toggle">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* CONTENT */}
      {open && entries.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.detailsTable}>
            <tbody>
              {entries.map(([key, value]) => (
                <tr key={key}>
                  <td className={styles.keyCell}>{formatKeyLabel(key)}</td>
                  <td className={styles.valueCell}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const BasicContent = (props) => {
  // const userDetails = useSelector((state) => state?.form?.userDetails);

  const { astroDetails } = props || {};

  //   if (!birthDetails || !birthPanchang || !astroDetails) return null;

  // Helper to format date
  const formatDate = (d, m, y) =>
    `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;

  // Helper to format time (12-hour with AM/PM)
  const formatTime = (hour, minute) => {
    let h = Number(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )} ${suffix}`;
  };
  const monthMap = {
    Jan: 1,
    January: 1,
    Feb: 2,
    February: 2,
    Mar: 3,
    March: 3,
    Apr: 4,
    April: 4,
    May: 5,
    Jun: 6,
    June: 6,
    Jul: 7,
    July: 7,
    Aug: 8,
    August: 8,
    Sep: 9,
    September: 9,
    Oct: 10,
    October: 10,
    Nov: 11,
    November: 11,
    Dec: 12,
    December: 12,
  };

  const basic = {
    title: "Basic Details",
    data: {
      Name: "Priya Gupta",
      Date: 12 / 12 / 1999,
      Time: "08:09 AM",
      Place: "Mumbai Maharashtra India",
      Latitude: 18.9581934,
      Longitude: 72.8320729,
      Timezone: 5.5,
      Ayanamsha: capitalizeWords(astroDetails.ayanamsa.toFixed(5)),
    },
  };

  const panchangTable = {
    title: "Panchang Details",
    data: {
      Nakshatra: capitalizeWords(astroDetails.nakshatra),
      Tithi: capitalizeWords(astroDetails.tithi),
      Karana: capitalizeWords(astroDetails.karana),
      Yoga: capitalizeWords(astroDetails.yoga),
    },
  };

  const astros = {
    title: "Avakhada Details",
    data: {
      Gana: capitalizeWords(astroDetails.gana),
      Yoni: capitalizeWords(astroDetails.yoni),
      Vasya: capitalizeWords(astroDetails.vasya),
      Nadi: capitalizeWords(astroDetails.nadi),
      Varna: capitalizeWords(astroDetails.varna),

      Paya: capitalizeWords(astroDetails.paya),
      "Paya By Nakshatra": capitalizeWords(astroDetails.paya_by_nakshatra),

      Tatva: capitalizeWords(astroDetails.tatva),

      "Life Stone": capitalizeWords(astroDetails.life_stone),
      "Lucky Stone": capitalizeWords(astroDetails.lucky_stone),
      "Fortune Stone": capitalizeWords(astroDetails.fortune_stone),

      "Name Start": capitalizeWords(astroDetails.name_start),

      "Ascendant Sign": capitalizeWords(astroDetails.ascendant_sign),
      "Ascendant Nakshatra": capitalizeWords(astroDetails.ascendant_nakshatra),

      Rasi: capitalizeWords(astroDetails.rasi),
      "Rasi Lord": capitalizeWords(astroDetails.rasi_lord),

      Nakshatra: capitalizeWords(astroDetails.nakshatra),
      "Nakshatra Lord": capitalizeWords(astroDetails.nakshatra_lord),
      "Nakshatra Pada": capitalizeWords(astroDetails.nakshatra_pada),

      "Sun Sign": capitalizeWords(astroDetails.sun_sign),

      Tithi: capitalizeWords(astroDetails.tithi),
      Karana: capitalizeWords(astroDetails.karana),
      Yoga: capitalizeWords(astroDetails.yoga),

      Ayanamsha: capitalizeWords(astroDetails.ayanamsa.toFixed(5)),
    },
  };

  return (
    <div>
      {/* <div className=" flex mb-4 ">
        <PrimaryText isSemiBold size_20 color={appColors.tri}>
          Priya Gupta
        </PrimaryText>
        <div className=" mr-2 ml-2" />
        <PrimaryText isSemiBold size_20 color={appColors.tri}>
          ({12} - {12} - {1999})
        </PrimaryText>
      </div> */}

      <div className={styles.gridContainer}>
        <div className={styles.basicCard}>
          <DetailCard {...basic} defaultOpen />
        </div>

        <div className={styles.panchangCard}>
          <DetailCard {...panchangTable} />
        </div>

        <div className={styles.avakhadaCard}>
          <DetailCard {...astros} />
        </div>
      </div>
    </div>
  );
};

export default BasicContent;
