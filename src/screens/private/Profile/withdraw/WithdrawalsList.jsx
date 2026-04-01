import { useState } from "react";
import { Icons } from "../../../../components/Icons";
import { useGetWithdrawalHistoryQuery } from "../../../../redux/oderHistory/orderHistory";
import Pagination from "../../../../components/UI/pagination/Pagination";
import styles from "./WithdrawalsList.module.scss";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).replace(",", ",");

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const STATUS_MAP = {
  pending: { label: "Pending", className: "statusPending" },
  approved: { label: "Approved", className: "statusApproved" },
  rejected: { label: "Rejected", className: "statusRejected" },
  paid: { label: "Paid", className: "statusApproved" },
};

const WithdrawalsList = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetWithdrawalHistoryQuery(
    { page, limit: 10 },
    { refetchOnMountOrArgChange: true },
  );

  const rawList = data?.data?.withdrawals || data?.data?.data || data?.data;
  const withdrawals = Array.isArray(rawList) ? rawList : [];
  const pagination = data?.data?.pagination || data?.pagination;

  if (isLoading) {
    return (
      <div className={styles.loadingCenter}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!withdrawals.length) {
    return (
      <div className={styles.emptyState}>
        <Icons.Wallet size={40} />
        <p>No withdrawal requests yet</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Withdrawal Cards */}
      <div className={styles.list}>
        {withdrawals.map((item) => {
          const status = STATUS_MAP[item?.status?.toLowerCase()] || STATUS_MAP.pending;
          const bankName = item?.bank_detail?.bank_name || "Bank";
          const accLast4 = item?.bank_detail?.account_number?.slice(-4) || "****";

          return (
            <div key={item._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardId}>#{item?.request_id}</span>
                <span className={styles.cardDate}>
                  {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
                </span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <div className={styles.cardIcon}>
                    <Icons.Wallet size={20} />
                  </div>
                  <div>
                    <p className={styles.cardTitle}>Withdrawal Request</p>
                    <p className={styles.cardBank}>{bankName} ••••{accLast4}</p>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <p className={styles.cardAmount}>
                    - ₹{(item?.requested_amount || 0).toLocaleString("en-IN")}
                  </p>
                  <span className={styles[status.className]}>{status.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination?.page}
        totalPages={pagination?.totalPages}
        totalItems={pagination?.totalDocs}
        limit={pagination?.limit || 10}
        hasPreviousPage={pagination?.hasPrevPage}
        hasNextPage={pagination?.hasNextPage}
        onPageChange={setPage}
        disabled={isFetching}
      />

      {isFetching && (
        <div className={styles.loadingCenter}>
          <div className={styles.spinner} />
        </div>
      )}
    </div>
  );
};

export default WithdrawalsList;
