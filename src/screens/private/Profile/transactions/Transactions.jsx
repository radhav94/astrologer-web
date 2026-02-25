import { Icons } from "../../../../components/Icons";
import { AppImages } from "../../../../utils/appImages";
import styles from "./Transactions.module.scss";
import SwitchTabs from "../../../../components/UI/tabs/SwitchTabs";
import { useGetTransactionListQuery } from "../../../../redux/profileApi/profileApi";
import { useRef, useState } from "react";

const TRANSACTIONS = [
  {
    id: 1,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: 2,
    title: "Withdrawal to bank",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 5000,
    isCredit: false,
  },
  {
    id: 3,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: 4,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: 5,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: 6,
    title: "Withdrawal to bank",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 5000,
    isCredit: false,
  },
  {
    id: 7,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: 8,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
  {
    id: 9,
    title: "Call with #1876",
    date: "Oct 01, 2025 • 04:36 PM",
    amount: 200,
    isCredit: true,
  },
];

const GIFT_RECEIVED = [
  {
    id: 1896,
    giftName: "Pooja Thali",
    giftImage: AppImages.Ring, // Replace with actual gift image
    senderName: "Swati Sharma",
    date: "Oct 01, 2025",
    time: "04:36 PM",
    amount: 200,
    isClaimed: false,
  },
  {
    id: 1896,
    giftName: "Pooja Thali",
    giftImage: AppImages.Ring, // Replace with actual gift image
    senderName: "Swati Sharma",
    date: "Oct 01, 2025",
    time: "04:36 PM",
    amount: 200,
    isClaimed: true,
  },
  {
    id: 1896,
    giftName: "Pooja Thali",
    giftImage: AppImages.Ring, // Replace with actual gift image
    senderName: "Swati Sharma",
    date: "Oct 01, 2025",
    time: "04:36 PM",
    amount: 200,
    isClaimed: false,
  },
  {
    id: 1896,
    giftName: "Pooja Thali",
    giftImage: AppImages.Ring, // Replace with actual gift image
    senderName: "Swati Sharma",
    date: "Oct 01, 2025",
    time: "04:36 PM",
    amount: 200,
    isClaimed: false,
  },
  {
    id: 1896,
    giftName: "Pooja Thali",
    giftImage: AppImages.Ring, // Replace with actual gift image
    senderName: "Swati Sharma",
    date: "Oct 01, 2025",
    time: "04:36 PM",
    amount: 200,
    isClaimed: true,
  },
];

const LIMIT = 15;


export const TransactionHistory = () => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const loaderRef = useRef(null);

  const { data:transactionHistory, isFetching } =
    useGetTransactionListQuery({ page, limit: LIMIT });

    console.log("transactionHistory:",transactionHistory)


  return (
    <div>
      {TRANSACTIONS.map((item, idx) => (
        <div key={`${item.id}-${idx}`} className={styles.transactionItem}>
          <div className={styles.transactionHeader}>
            <span className={styles.transactionId}>
              #{item.id} • {item.date}
            </span>
            <span
              className={`${styles.transactionAmount} ${
                item.isCredit ? styles.credit : styles.debit
              }`}
            >
              {item.isCredit ? "+" : "-"} ₹{item.amount}
            </span>
          </div>
          <h4 className={styles.transactionTitle}>{item.title}</h4>
        </div>
      ))}
    </div>
  );
};

export const GiftsReceived = () => {
  return (
    <div>
      {GIFT_RECEIVED.map((gift, idx) => (
        <div key={`${gift.id}-${idx}`} className={styles.giftItem}>
          <img
            src={gift.giftImage}
            alt={gift.giftName}
            className={styles.giftImage}
          />
          <div className={styles.giftContent}>
            <div className={styles.giftHeader}>
              <div className={styles.giftInfo}>
                <p className={styles.giftMeta}>
                  #{gift.id} • {gift.date} • {gift.time}
                </p>
                <h4 className={styles.giftName}>{gift.giftName}</h4>
                <p className={styles.giftSender}>From {gift.senderName}</p>
              </div>
              
            </div>
            <div className="d-flex flex-column">
              <span className={styles.giftAmount}>+ ₹{gift.amount}</span>
              <button
              className={`${styles.claimButton} ${
                gift.isClaimed ? styles.claimed : ""
              }`}
            >
              {gift.isClaimed ? "Claimed" : "Claim"}
              {!gift.isClaimed && <Icons.ChevronRight size={16} />}
            </button>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
};

const Transactions = () => {
  const tabs = [
    {
      label: "Transaction History",
      value: "transactions",
      component: TransactionHistory,
    },
    {
      label: "Gifts Received",
      value: "gifts",
      component: GiftsReceived,
    },
  ];

  const customTabStyles = {
    container: styles.transactionsContainer,
    buttonGroup: styles.tabsHeader,
    button: styles.tabButton,
    activeButton: styles.active,
    content: styles.tabContent,
  };

  return (
    <div className={styles.transactionsWrapper}>
      <SwitchTabs 
        tabs={tabs} 
        defaultTab="transactions" 
        customStyles={customTabStyles}
      />
      <button className={styles.contactSupportButton}>
        Contact Support <Icons.ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Transactions;
