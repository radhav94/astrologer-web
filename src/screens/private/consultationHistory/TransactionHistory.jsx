import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { Icons } from "../../../components/Icons";
import { Toast } from "../../../components";
import { useLazyGetTransactionInvoiceQuery } from "../../../redux/profileApi/profileApi";
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
  const [getInvoice] = useLazyGetTransactionInvoiceQuery();
  const [loadingId, setLoadingId] = useState(null);

  /** Download invoice for a given transaction */
  const handleDownloadInvoice = useCallback(async (e, transactionId) => {
    e.stopPropagation();
    if (!transactionId || loadingId) return;

    setLoadingId(transactionId);
    try {
      const { data, error } = await getInvoice(transactionId);
      if (error) {
        Toast.error("Invoice not available for this transaction");
        return;
      }
      const pdfUrl =
        data?.data?.pdfUrl ||
        data?.data?.url ||
        data?.data ||
        data?.pdfUrl ||
        data?.url;

      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
      } else {
        Toast.error("Invoice not available");
      }
    } catch (err) {
      console.error("[Invoice] Error:", err);
      Toast.error("Failed to download invoice");
    } finally {
      setLoadingId(null);
    }
  }, [getInvoice, loadingId]);

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
            <div className={styles.amountRow}>
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
              <button
                className={`${styles.downloadInvoiceBtn} ${loadingId === item._id ? styles.downloadLoading : ""}`}
                onClick={(e) => handleDownloadInvoice(e, item._id)}
                title="Download Invoice"
                disabled={loadingId === item._id}
              >
                {loadingId === item._id ? (
                  <span className={styles.btnSpinner} />
                ) : (
                  <Download size={16} />
                )}
              </button>
            </div>
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