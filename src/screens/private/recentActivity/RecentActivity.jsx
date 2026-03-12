import React, { useEffect, useRef, useState } from "react";
import { Icons } from "../../../components/Icons";
import { Link } from "react-router";
import { useGetRecentAstrologerActivitiesQuery } from "../../../redux/recentActivities/recentActivities";
import SectionHeader from "../../../components/UI/SectionHeader";
import styles from "./RecentActivity.module.scss";
import dayjs from "dayjs";

const LIMIT = 5;

const RecentActivity = ({ onBack }) => {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const loaderRef = useRef(null);

  const { data, isFetching } =
    useGetRecentAstrologerActivitiesQuery({ page, limit: LIMIT });

  useEffect(() => {
      console.log("dataaaaaa",data);

    if (data?.data?.records?.length) {

      setRecords((prev) => [...prev, ...data?.data?.records]);
    }
  }, [data]);

  useEffect(() => {
    if (!loaderRef.current || !data?.data?.pagination?.hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [data, isFetching]);

  // console.log("recordsssssssss",records);

  return (
    
    <div className={styles.container}>
      {/* HEADER */}
     <div className={styles.headerWrapper}>
        <SectionHeader title={"Recent Activity"} />
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {records.map((group) => (
          <div key={group.date} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>
              {dayjs(group?.date).format("DD/MM/YYYY")}
            </h3>

            <div className={styles.transactionsList}>
              {group.transactions.map((tx) => (
                <div
                  key={tx._id}
                  className={styles.transactionCard}
                >
                  <div className={styles.transactionLeft}>
                    <div className={styles.profileImageContainer}>
                      <img
                        className={styles.profileImage}
                        src={`https://picsum.photos/seed/${tx.userId}/200`}
                        alt=""
                      />
                    </div>

                    <div className={styles.transactionDetails}>
                      <p className={styles.transactionMessage}>
                        {tx.message}
                      </p>

                      {tx.reason === "call_billing" && (
                        <span className={styles.callBadge}>
                          Call
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.transactionRight}>
                    <p className={styles.transactionTime}>
                      {dayjs(tx.createdAt).format("MMM D, YYYY")}
                    </p>

                    {tx.amount > 0 && (
                      <p className={styles.transactionAmount}>
                        + ₹{tx.amount}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* LOAD MORE */}
        {data?.data?.pagination?.hasNextPage && (
          <div ref={loaderRef} className={styles.loadMoreContainer}>
            {isFetching && (
              <p className={styles.loadingText}>Loading...</p>
            )}
          </div>
        )}
      </div>
    </div>
    
  );
};

export default RecentActivity;
