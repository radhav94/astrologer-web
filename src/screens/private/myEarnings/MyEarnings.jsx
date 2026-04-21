import { useState, useCallback, useRef, useEffect } from "react";
import { StatCard } from "./statCard/StatCard";
import TransactionsTable from "./transactionsTable/TransactionsTable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
/* Old: two separate DateTimePicker components — replaced with single range DatePicker
import DateTimePicker from "../../../components/UI/dateTimePicker/DateTimePicker";
*/
import { Wallet, PiggyBank, ArrowDownToLine, Hourglass, Download, Calendar } from "lucide-react";
import { useGetTransactionListQuery } from "../../../redux/profileApi/profileApi";
import SectionHeader from "../../../components/UI/SectionHeader";
import dayjs from "dayjs";
import styles from "./MyEarning.module.scss";

/** Range options — label (UI) → value (API dateRange param) */
const RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Week", value: "last7days" },
  { label: "Month", value: "last30days" },
  { label: "Custom", value: "custom" },
];

const MyEarnings = () => {
  // Date range state
  const [selectedRange, setSelectedRange] = useState("last30days"); // default: Month
  const [customFromDate, setCustomFromDate] = useState(null);
  const [customToDate, setCustomToDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Transaction table state
  const [page, setPage] = useState(1);
  const [filterBy, setFilterBy] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  /* Old: submit-on-enter approach — replaced with debounce
  const [submittedSearch, setSubmittedSearch] = useState("");
  const handleSearchSubmit = () => setSubmittedSearch(search);
  */

  /** Debounce search — update API query 400ms after user stops typing */
  const debounceRef = useRef(null);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  /** Handle range selection */
  const handleRangeChange = useCallback((value) => {
    setSelectedRange(value);
    setPage(1);
    if (value === "custom") {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      setCustomFromDate(null);
      setCustomToDate(null);
    }
  }, []);

  /** Close date picker on outside click */
  useEffect(() => {
    if (!showDatePicker) return;
    const handler = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDatePicker]);

  /** Format Date to YYYY-MM-DD for API */
  const formatDate = (d) => {
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Build API params based on selected range
  const isCustom = selectedRange === "custom";
  const hasCustomDates = isCustom && customFromDate && customToDate;

  const { data: txnData, isFetching } = useGetTransactionListQuery({
    page,
    limit: 10,
    ...(filterBy && { filterBy }),
    ...(filterBy === "gift" && { giftcheck: true }),
    ...(debouncedSearch && { search: debouncedSearch }),
    // Predefined range
    ...(!isCustom && { dateRange: selectedRange }),
    // Custom range — only when both dates are set
    ...(hasCustomDates && {
      customFromDate: formatDate(customFromDate),
      customToDate: formatDate(customToDate),
    }),
  }, { refetchOnMountOrArgChange: true });

  const transactions = txnData?.data?.transactions || [];
  const pagination = txnData?.data?.pagination;

  /** Escape a value for CSV (handle commas, quotes, newlines) */
  const escapeCSV = (val) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  /** Derive type from description — same logic as TransactionsTable */
  const getType = (item) => {
    const desc = (item?.description || "").toLowerCase();
    if (desc.includes("withdraw")) return "Withdrawal";
    if (desc.includes("gift")) return "Gift";
    if (desc.includes("video")) return "Video";
    if (desc.includes("call") || desc.includes("audio")) return "Call";
    if (desc.includes("chat")) return "Chat";
    return "Call";
  };

  /** Format duration seconds */
  const fmtDuration = (s) => {
    if (!s) return "--";
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  /** Download current transactions as CSV */
  const handleDownloadReport = useCallback(() => {
    if (!transactions.length) return;

    const headers = ["Name", "Transaction", "Date", "Type", "Duration", "Amount", "Status"];
    const rows = transactions.map((item) => [
      escapeCSV(item?.displayProfile?.name || "--"),
      escapeCSV(`TXN-${item?._id?.slice(-4) || "--"}`),
      escapeCSV(item.createdAt ? dayjs(item.createdAt).format("DD MMM YYYY") : "--"),
      escapeCSV(getType(item)),
      escapeCSV(fmtDuration(item?.sessionDetails?.durationSeconds)),
      escapeCSV(`₹${item?.billing?.astrologer?.creditAmount?.toLocaleString("en-IN") || 0}`),
      escapeCSV(item?.billing?.astrologer?.action === "credit" ? "Completed" : "Pending"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_report_${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContents}>
          <SectionHeader title="MY EARNINGS" />
        </div>
        <div className={styles.controls}>
          {/* Range pills — wrapper is position:relative for the overlay */}
          <div className={styles.rangePillsWrapper}>
            <div className={styles.rangePills}>
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleRangeChange(r.value)}
                  className={`${styles.rangeBtn} ${selectedRange === r.value ? styles.rangeBtnActive : ""}`}
                >
                  {r.value === "custom" && <Calendar className={styles.calendarIcon} />}
                  {r.label}
                </button>
              ))}
            </div>

            {/* DatePicker overlay — floats below Custom button */}
            {showDatePicker && isCustom && (
              <div className={styles.datePickerOverlay} ref={datePickerRef}>
                <DatePicker
                  selected={customFromDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    setCustomFromDate(start);
                    setCustomToDate(end);
                    if (start && end) {
                      setPage(1);
                      setShowDatePicker(false);
                    }
                  }}
                  startDate={customFromDate}
                  endDate={customToDate}
                  selectsRange
                  inline
                  maxDate={new Date()}
                />
              </div>
            )}
          </div>

          <button
            className={styles.downloadBtn}
            onClick={handleDownloadReport}
            disabled={!transactions.length || isFetching}
          >
            <Download className={styles.downloadIcon} />
            Download Report
          </button>
        </div>
      </div>

      {/* Old inline custom date picker — moved to overlay above
      {isCustom && (
        <div className={styles.customDateRow}>...</div>
      )}
      */}

      {/* Summary cards */}
      <div className={styles.cardsGrid}>
        <StatCard icon={Wallet} label="Total Earnings" value="₹81,420" change={18.4}  variant="primary" />
        <StatCard icon={PiggyBank} label="Available Balance" value="₹47,67,590" change={12.6}  variant="success" />
        <StatCard icon={ArrowDownToLine} label="Withdrawn Amount" value="₹2,14,800" change={-3.2} variant="info" />
        <StatCard icon={Hourglass} label="Pending Clearance" value="₹6,240" change={5.1} variant="warning" />
      </div>

      {/* Transactions — API driven */}
      <TransactionsTable
        transactions={transactions}
        pagination={pagination}
        isFetching={isFetching}
        page={page}
        setPage={setPage}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        search={search}
        setSearch={setSearch}
      />
    </div>
  );
};

export default MyEarnings;