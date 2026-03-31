import { Icons } from "../../../components/Icons";
import dayjs from "dayjs";
import Pagination from "../../../components/UI/pagination/Pagination";
import parentStyles from "./ConsultationHistory.module.scss";
import styles from "./TransactionHistory.module.scss";

const LIMIT = 10;

const TransactionHistory = ({
  transactions = [],
  pagination,
  isFetching = false,
  isError = false,
  hasActiveFilters = false,
  onResetFilters,
  page = 1,
  setPage,
}) => {
  return (
    <div className={styles.listContainer}>
      {/* Loading */}
      {isFetching && transactions.length === 0 && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
        </div>
      )}

      {/* No results with active filters */}
      {!isFetching && (transactions.length === 0 || isError) && hasActiveFilters && (
        <div className={parentStyles.noResultsContainer}>
          <div className={parentStyles.emptyIcon}>
            <Icons.FileText size={48} />
          </div>
          <p className={parentStyles.emptyTitle}>No results found</p>
          <p className={parentStyles.emptySubtitle}>
            Try adjusting your search or filters
          </p>
          <button className={parentStyles.resetButton} onClick={onResetFilters}>
            <Icons.X size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* Empty state without filters */}
      {!isFetching && transactions.length === 0 && !isError && !hasActiveFilters && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No transactions yet</p>
        </div>
      )}

      {/* Transaction list */}
      {transactions.map((item, idx) => (
        <div key={item._id || `${item.id}-${idx}`} className={styles.transactionItem}>
          <div className={styles.transactionHeader}>
            <span className={styles.transactionId}>
             #{item?._id?.slice(-4)} •{" "}
              {dayjs(item.createdAt).format("MMM DD, YYYY")} •{" "}
              {dayjs(item.createdAt).format("hh:mm A")}
            </span>
            <span
              className={`${styles.transactionAmount} ${
                item?.billing?.astrologer?.action === "credit"
                  ? styles.credit
                  : styles.debit
              }`}
            >
              {item?.billing?.astrologer?.action === "credit" ? "+" : "-"} ₹
              {item?.billing?.astrologer?.creditAmount?.toLocaleString("en-IN") || 0}
            </span>
          </div>
          <h4 className={styles.transactionTitle}>
            {item.description}{" "}
            {item?.displayProfile?.name && (
              <span className={styles.displayProfile}>{item.displayProfile.name}</span>
            )}
          </h4>
        </div>
      ))}

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage || page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={LIMIT}
          hasPreviousPage={pagination.hasPreviousPage}
          hasNextPage={pagination.hasNextPage}
          onPageChange={setPage}
          disabled={isFetching}
        />
      )}
    </div>
  );
};

export default TransactionHistory;
