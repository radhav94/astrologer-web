import { useState, useCallback } from "react";
import { Search, MessageSquare, Phone, Video, Gift, Download, ArrowDownToLine } from "lucide-react";
import { useLazyGetTransactionInvoiceQuery } from "../../../../redux/profileApi/profileApi";
import { Toast } from "../../../../components";
import Pagination from "../../../../components/UI/pagination/Pagination";
import dayjs from "dayjs";
import styles from "./TransactionsTable.module.scss";

const TYPE_ICON = { Chat: MessageSquare, Call: Phone, Video, Gift, Withdrawal: ArrowDownToLine };
const TYPE_CLASS_MAP = { Chat: "typeChat", Call: "typeCall", Video: "typeVideo", Gift: "typeGift", Withdrawal: "typeWithdrawal" };
const FILTERS = ["All", "Chat", "Call", "Video", "Gift", "Withdrawal"];
const LIMIT = 10;

const getTransactionType = (item) => {
  const desc = (item?.description || "").toLowerCase();
  if (desc.includes("withdraw")) return "Withdrawal";
  if (desc.includes("gift")) return "Gift";
  if (desc.includes("video")) return "Video";
  if (desc.includes("call") || desc.includes("audio")) return "Call";
  if (desc.includes("chat")) return "Chat";
  return "Call";
};

const formatDuration = (seconds) => {
  if (!seconds) return "--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
};

export const TransactionsTable = ({
  transactions = [],
  pagination,
  isFetching = false,
  page = 1,
  setPage,
  filterBy,
  setFilterBy,
  search,
  setSearch,
}) => {
  const [getInvoice] = useLazyGetTransactionInvoiceQuery();
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);

  /** Download invoice for a transaction */
  const handleDownloadInvoice = useCallback(async (e, transactionId) => {
    e.stopPropagation();
    if (!transactionId || loadingInvoiceId) return;
    setLoadingInvoiceId(transactionId);
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
    } catch {
      Toast.error("Failed to download invoice");
    } finally {
      setLoadingInvoiceId(null);
    }
  }, [getInvoice, loadingInvoiceId]);

  const COL_COUNT = 8; // Name + Transaction + Date + Type + Duration + Amount + Status + Invoice

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContents}>
            <h3 className={styles.title}>Recent Transactions</h3>
            <p className={styles.subtitle}>All your consultation earnings</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterPills}>
              {FILTERS.map((f) => {
                const isActive = f === "All" ? !filterBy : filterBy === f.toLowerCase();
                return (
                  <button
                    key={f}
                    onClick={() => {
                      setFilterBy(f === "All" ? "" : f.toLowerCase());
                      if (setPage) setPage(1);
                    }}
                    className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ""}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Transaction</th>
                <th>Date</th>
                <th>Type</th>
                <th>Duration</th>
                <th className={styles.thRight}>Amount</th>
                <th className={styles.thCenter}>Status</th>
                <th className={styles.thCenter}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {isFetching && transactions.length === 0 ? (
                <tr>
                  <td colSpan={COL_COUNT} className={styles.emptyRow}>Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={COL_COUNT} className={styles.emptyRow}>No transactions found</td>
                </tr>
              ) : (
                transactions.map((item, idx) => {
                  const type = getTransactionType(item);
                  const Icon = TYPE_ICON[type] || Phone;
                  const typeStyleKey = TYPE_CLASS_MAP[type] || "typeCall";
                  const isInvoiceLoading = loadingInvoiceId === item._id;
                  return (
                    <tr key={item._id || idx}>
                      <td className={styles.cellName}>
                        {item?.displayProfile?.name || "--"}
                      </td>
                      <td className={styles.cellId}>TXN-{item?._id?.slice(-4) || "--"}</td>
                      <td className={styles.cellMuted}>
                        {item.createdAt ? dayjs(item.createdAt).format("DD MMM YYYY") : "--"}
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${styles[typeStyleKey]}`}>
                          <Icon className={styles.typeIcon} />
                          {type}
                        </span>
                      </td>
                      <td className={styles.cellMuted}>
                        {formatDuration(item?.sessionDetails?.durationSeconds)}
                      </td>
                      <td className={styles.cellAmount}>
                        ₹{item?.billing?.astrologer?.creditAmount?.toLocaleString("en-IN") || 0}
                      </td>
                      <td className={styles.cellStatus}>
                        <span className={`${styles.statusBadge} ${
                          item?.billing?.astrologer?.action === "credit"
                            ? styles.statusCompleted
                            : styles.statusPending
                        }`}>
                          {item?.billing?.astrologer?.action === "credit" ? "Completed" : "Pending"}
                        </span>
                      </td>
                      <td className={styles.cellInvoice}>
                        <button
                          className={`${styles.invoiceBtn} ${isInvoiceLoading ? styles.invoiceBtnLoading : ""}`}
                          onClick={(e) => handleDownloadInvoice(e, item._id)}
                          disabled={isInvoiceLoading}
                          title="Download Invoice"
                        >
                          {isInvoiceLoading ? (
                            <span className={styles.invoiceSpinner} />
                          ) : (
                            <Download size={15} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </>
  );
};

export default TransactionsTable;