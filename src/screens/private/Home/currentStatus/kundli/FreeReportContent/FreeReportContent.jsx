import SwitchTabs from "../../../../../../components/UI/tabs/switchtabs/SwitchTabs";
import KaalSarp from "./kaalsarp/KaalSarp";
import Mangal from "./mangal/Mangal";
import Manglik from "./manglik/Manglik";
import Pitra from "./pitra/Pitra";
import SadeSati from "./sadesati/SadeSati";

const FreeReport = (props) => {
  const {userDetails } = props || {};
  const tabs = [
    {
      label: "Manglik",
      value: "manglik",
      // component: Manglik,
      component: () => (
        <Manglik
        userDetails={userDetails}
        />
      ),
      // children: [
      //   {
      //     label: "General",
      //     value: "generalInfo",
      //     component: () => <General />,
      //   },
      //   {
      //     label: "Planetary",
      //     value: "planetary",
      //     component: () => <Planetary />,
      //   },
      //   {
      //     label: "Vimshottari Dasha",
      //     value: "vimshottari",
      //     component: () => <Vimshottari />,
      //   },
      //   { label: "Yoga", value: "yoga", component: Yoga },
      // ],
    },
    {
      label: "Kaal Sarp",
      value: "kaalsarp",
      // component: KaalSarp,
      component: () => (
        <KaalSarp
        userDetails={userDetails}
        />
      ),
      // children: [
      //   {
      //     label: "Rudraksha",
      //     value: "rudraksha",
      //     component: () => <Rudraksha />,
      //   },
      //   {
      //     label: "Gemstones",
      //     value: "gemstones",
      //     component: () => <Gemstones />,
      //   },
      // ],
    },
    {
      label: "Mangal",
      value: "mangal",
      // component: Mangal,
      component: () => (
        <Mangal
        userDetails={userDetails}
        />
      ),
      // children: [
      //   { label: "Manglik", value: "manglik", component: () => <Manglik /> },
      //   { label: "Kalsarpa", value: "kalsarpa", component: () => <Kalsarpa /> },
      //   { label: "Sadesati", value: "sadesati", component: () => <Saresati /> },
      // ],
    },
    {
      label: "Pitra",
      value: "pitra",
      // component: Pitra,
      component: () => (
        <Pitra
        userDetails={userDetails}
        />
      ),
    },
    {
      label: "Sade Sati",
      value: "Sade Sati",
      // component: SadeSati,
      component: () => (
        <SadeSati
        userDetails={userDetails}
        />
      ),
    },
  ];

  // const tabs = [
  //   { label: "North Indian", value: "north", component: () => <NorthIndian /> },
  //   { label: "South Indian", value: "south", component: () => <SouthIndian /> },
  // ];
  return (
    <div>
      {/* <NestedTabs tabs={tabs} /> */}
      <SwitchTabs tabs={tabs} />
    </div>
  );
};

export default FreeReport;
