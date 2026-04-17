import { useEffect, useState } from "react";
import { Icons } from "../../../components/Icons";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import {
  useGetOrderHistoryQuery,
  useRefundInitiateByAstrologerMutation,
} from "../../../redux/oderHistory/orderHistory";
import SectionHeader from "../../../components/UI/SectionHeader";
import TransactionHistory from "./TransactionHistory";
import OrderHistory from "./OrderHistory";
import GiftReceivedHistory from "./GiftReceivedHistory";
import { useGetTransactionListQuery, useGetGiftReceivedListQuery } from "../../../redux/profileApi/profileApi";
import styles from "./ConsultationHistory.module.scss";
import dayjs from "dayjs";
import { PATH } from "../../../utils/routes/Paths";
import useHistoryFilters from "../../../hooks/useHistoryFilters";
import DateTimePicker from "../../../components/UI/dateTimePicker/DateTimePicker";
import { Toast } from "../../../components";

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} Min ${secs} Secs`;
};

const groupByDate = (transactions) => {
  const groups = {};
  transactions.forEach((item) => {
    const date = dayjs(item?.createdAt).format("DD/MM/YYYY");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  return groups;
};

const ConsultationHistory = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [refundItem, setRefundItem] = useState(null);
  const [refundMinutes, setRefundMinutes] = useState("");
  const [refundType, setRefundType] = useState("partial");

  // Shared filter hook for both tabs
  const filterHook = useHistoryFilters();
  const {
    orderPage, setOrderPage,
    txnPage, setTxnPage,
    giftPage, setGiftPage,
    searchQuery,
    orderQueryParams, txnQueryParams, giftQueryParams,
    hasActiveFilters,
    showFilterModal,
    activeFilterTab,
    setActiveFilterTab,
    tempFilters,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    openFilterModal,
    applyFilters,
    resetFilters,
    updateTempFilter,
    setShowFilterModal,
  } = filterHook;

  const navigate = useNavigate();

  const { data, isLoading, isFetching, isError } = useGetOrderHistoryQuery(orderQueryParams, {
    refetchOnMountOrArgChange: true,
  });

  // Transaction history API — shared filters from the hook
  const {
    data: txnData,
    isFetching: txnFetching,
    isError: txnError,
  } = useGetTransactionListQuery(txnQueryParams, {
    refetchOnMountOrArgChange: true,
  });
  const txnTransactions = txnData?.data?.transactions || [];
  const txnPagination = txnData?.data?.pagination;

  // Gift received API
  const {
    data: giftData,
    isFetching: giftFetching,
    isError: giftError,
  } = useGetGiftReceivedListQuery(giftQueryParams, {
    refetchOnMountOrArgChange: true,
  });
  const giftTransactions = giftData?.data?.transactions || [];
  const giftPagination = giftData?.data?.pagination;

  // Refund mutation hook
  const [refundInitiate, { isLoading: isRefunding }] =
    useRefundInitiateByAstrologerMutation();

  // Handle refund API call with proper success/error toast messages
  const handleRefund = async () => {
    if (!refundItem || !refundMinutes) return;
    try {
      const res = await refundInitiate({
        astrologerId: refundItem?.astrologerId,
        minutes: Number(refundMinutes),
        roomId: refundItem?.roomId,
        userId: refundItem?.userId,
      }).unwrap();

      // API may return 200 OK but with error statusCode in body (e.g. statusCode: 500)
      if (res?.statusCode && res.statusCode >= 400) {
        Toast.error(res?.message || "Refund failed. Please try again.");
      } else {
        Toast.success(res?.message || "Refund initiated successfully.");
      }
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.error?.data?.message ||
        err?.message ||
        "Refund failed. Please try again.";
      Toast.error(errorMsg);
    } finally {
      // Always close modal regardless of success or error
      setRefundItem(null);
      setRefundMinutes("");
      setRefundType("partial");
    }
  };

  const pagination = data?.data?.pagination;
  const transactions = data?.data?.transactions || [];

  // close menu on outside click
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [orderPage, txnPage, giftPage]);

  const handleNavigation = (type, item) => {
    navigate(`/order-details/${item?.userId}`, {
      state: {
        userName: item?.displayProfile?.name || "User",
        profileImage: item?.displayProfile?.profileImage,
        tab: type === "video" ? "Video" : type === "chat" ? "Chat" : "Call",
      },
    });
  };

  // Show loading overlay only on initial load, not during pagination
  const isInitialLoading = isLoading && transactions.length === 0;

  // Error state — only show full-page error when NO filters are active
  if (isError && !hasActiveFilters) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <Icons.AlertCircle size={40} />
          </div>
          <p className={styles.errorTitle}>Failed to load history</p>
          <p className={styles.errorMessage}>Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state — only show full-page empty when NO filters are active
  if (!isLoading && transactions.length === 0 && !hasActiveFilters) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyHeader}>
          <Link to="/dashboard">
            <button className={styles.backButton}>
              <Icons.ChevronLeft size={22} />
            </button>
          </Link>
          <h1 className={styles.emptyHeaderTitle}>Consultation History</h1>
        </div>
        <div className={styles.emptyBody}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIcon}>
              <Icons.FileText size={48} />
            </div>
            <p className={styles.emptyTitle}>No consultation history</p>
            <p className={styles.emptySubtitle}>
              Your consultations will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.headerWrapper}>
        <SectionHeader title={activeTab === "orders" ? "Order History" : activeTab === "transactions" ? "Transaction History" : "Gift Received"} />
        <h2 className={styles.ordersCount}>
          Total Records: {
            activeTab === "gifts"
              ? giftPagination?.totalItems || 0
              : activeTab === "transactions"
                ? txnPagination?.totalItems || 0
                : data?.data?.pagination?.totalItems || 0
          }
        </h2>
      </div>

      <div className={styles.mainContainer}>
        <main className={styles.mainContent}>
          {/* Orders Count and Actions */}
          <div className={styles.ordersHeader}>
            {/* Tab Buttons */}
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabBtn} ${activeTab === "orders" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                Order History
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "transactions" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("transactions")}
              >
                Transaction
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "gifts" ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab("gifts")}
              >
                Gift Received
              </button>
            </div>

            <div className={styles.actionButtons}>
              {/* Search Bar */}
              <div className={styles.searchBar}>
                <Icons.Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search name"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button className={styles.searchClear} onClick={clearSearch}>
                    <Icons.X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button className={styles.filterButton} onClick={openFilterModal}>
                <Icons.Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* List grouped by date */}
          {activeTab === "orders" && (
            <OrderHistory
              transactions={transactions}
              groupByDate={groupByDate}
              pagination={pagination}
              isLoading={isLoading}
              isError={isError}
              isFetching={isFetching}
              hasActiveFilters={hasActiveFilters}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              setRefundItem={setRefundItem}
              setRefundMinutes={setRefundMinutes}
              setRefundType={setRefundType}
              setPage={setOrderPage}
              onResetFilters={resetFilters}
              onNavigate={handleNavigation}
            />
          )}

          {/* Transaction History Tab */}
          {activeTab === "transactions" && (
            <TransactionHistory
              transactions={txnTransactions}
              pagination={txnPagination}
              isFetching={txnFetching}
              isError={txnError}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              page={txnPage}
              setPage={setTxnPage}
            />
          )}

          {/* Gift Received Tab */}
          {activeTab === "gifts" && (
            <GiftReceivedHistory
              transactions={giftTransactions}
              pagination={giftPagination}
              isFetching={giftFetching}
              isError={giftError}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              page={giftPage}
              setPage={setGiftPage}
            />
          )}

          {/* Withdrawals section moved to Profile.jsx → WithdrawalsList component */}

          {/* Refund Modal - Shared for both Refund (partial) and Total Refund */}
          {refundItem && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>
                  {refundType === "total" ? "Total Refund" : "Refund"}
                </h3>

                {/* Session duration info - shown only for partial refund */}
                {refundType === "partial" && (
                  <p className={styles.modalSubtext}>
                    Session Duration:{" "}
                    {formatDuration(
                      refundItem?.sessionDetails?.durationSeconds || 0,
                    )}
                  </p>
                )}

                {/* Minutes input: editable for partial, disabled & pre-filled for total */}
                <input
                  type="number"
                  placeholder="Enter refund minutes"
                  value={refundMinutes}
                  onChange={(e) => {
                    // Total refund: input is locked, skip onChange
                    if (refundType === "total") return;
                    const val = e.target.value;
                    // Accept only numeric values
                    if (val === "" || /^\d+$/.test(val)) {
                      const maxMinutes = Math.floor(
                        (refundItem?.sessionDetails?.durationSeconds || 0) / 60,
                      );
                      // Do not allow minutes greater than session duration
                      if (val === "" || Number(val) <= maxMinutes) {
                        setRefundMinutes(val);
                      }
                    }
                  }}
                  disabled={refundType === "total"}
                  min="0"
                  max={Math.floor(
                    (refundItem?.sessionDetails?.durationSeconds || 0) / 60,
                  )}
                  className={styles.modalInput}
                  style={
                    refundType === "total"
                      ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" }
                      : {}
                  }
                />

                <div className={styles.modalButtons}>
                  <button
                    onClick={() => {
                      setRefundItem(null);
                      setRefundType("partial");
                    }}
                    className={styles.modalCancelButton}
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!refundMinutes || isRefunding}
                    onClick={handleRefund}
                    className={styles.modalConfirmButton}
                  >
                    {isRefunding ? "Processing..." : "Confirm Refund"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Loading Overlay — shown only during initial load */}
      {isInitialLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>
              Loading consultation history...
            </p>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className={styles.filterModalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.filterModal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.filterModalHeader}>
              <h3 className={styles.filterModalTitle}>Filters</h3>
              <button className={styles.filterModalClose} onClick={() => setShowFilterModal(false)}>
                <Icons.X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.filterModalBody}>
              {/* Left: Category tabs */}
              <div className={styles.filterTabs}>
                {["Type", "Date Range", "Sort By"].map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterTab} ${activeFilterTab === cat ? styles.filterTabActive : ""}`}
                    onClick={() => setActiveFilterTab(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Right: Options */}
              <div className={styles.filterOptions}>
                {activeFilterTab === "Type" && (
                  <>
                    <div className={styles.filterOptionHeader}>
                      <span>Filter by Type</span>
                    </div>
                    {[
                      { value: "", label: "All" },
                      { value: "call", label: "Call" },
                      { value: "chat", label: "Chat" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={styles.filterOptionItem}
                        onClick={() => updateTempFilter("filterBy", tempFilters.filterBy === opt.value ? "" : opt.value)}
                      >
                        <span className={`${styles.tickIcon} ${tempFilters.filterBy === opt.value ? styles.tickIconActive : ""}`}>
                          {tempFilters.filterBy === opt.value && <Icons.Check size={16} />}
                        </span>
                        <span className={styles.filterOptionLabel}>{opt.label}</span>
                      </div>
                    ))}
                  </>
                )}

                {activeFilterTab === "Date Range" && (
                  <>
                    <div className={styles.filterOptionHeader}>
                      <span>Select Date Range</span>
                    </div>
                    {[
                      { value: "today", label: "Today" },
                      { value: "yesterday", label: "Yesterday" },
                      { value: "last7days", label: "Last 7 Days" },
                      { value: "last30days", label: "Last 30 Days" },
                      { value: "custom", label: "Custom Date Range" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={styles.filterOptionItem}
                        onClick={() => {
                          if (opt.value === "custom") {
                            // Toggle custom date mode — clear dateRange preset
                            updateTempFilter("dateRange", tempFilters.dateRange === "custom" ? "" : "custom");
                          } else {
                            updateTempFilter("dateRange", tempFilters.dateRange === opt.value ? "" : opt.value);
                          }
                        }}
                      >
                        <span className={`${styles.tickIcon} ${tempFilters.dateRange === opt.value ? styles.tickIconActive : ""}`}>
                          {tempFilters.dateRange === opt.value && <Icons.Check size={16} />}
                        </span>
                        <span className={styles.filterOptionLabel}>{opt.label}</span>
                      </div>
                    ))}

                    {/* Custom date pickers — shown when "Custom Date Range" is selected */}
                    {tempFilters.dateRange === "custom" && (
                      <div className={styles.customDateGroup}>
                        {/* Old native date inputs — replaced with DateTimePicker */}
                        {/* <label className={styles.customDateLabel}>
                          From Date
                          <input type="date" value={tempFilters.customFromDate} ... />
                        </label> */}
                        <DateTimePicker
                          label="From Date"
                          mode="date"
                          selected={tempFilters.customFromDate ? new Date(tempFilters.customFromDate) : null}
                          onChange={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, "0");
                              const dd = String(date.getDate()).padStart(2, "0");
                              updateTempFilter("customFromDate", `${yyyy}-${mm}-${dd}`);
                            } else {
                              updateTempFilter("customFromDate", "");
                            }
                          }}
                          maxDate={tempFilters.customToDate ? new Date(tempFilters.customToDate) : new Date()}
                          placeholder="DD/MM/YYYY"
                        />
                        <DateTimePicker
                          label="To Date"
                          mode="date"
                          selected={tempFilters.customToDate ? new Date(tempFilters.customToDate) : null}
                          onChange={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, "0");
                              const dd = String(date.getDate()).padStart(2, "0");
                              updateTempFilter("customToDate", `${yyyy}-${mm}-${dd}`);
                            } else {
                              updateTempFilter("customToDate", "");
                            }
                          }}
                          minDate={tempFilters.customFromDate ? new Date(tempFilters.customFromDate) : undefined}
                          maxDate={new Date()}
                          placeholder="DD/MM/YYYY"
                        />
                        {((tempFilters.customFromDate && !tempFilters.customToDate) ||
                          (!tempFilters.customFromDate && tempFilters.customToDate)) && (
                          <p className={styles.customDateError}>Both dates are required</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {activeFilterTab === "Sort By" && (
                  <>
                    <div className={styles.filterOptionHeader}>
                      <span>Sort By</span>
                    </div>
                    {[
                      { value: "latestFirst", label: "Latest First" },
                      { value: "oldestFirst", label: "Oldest First" },
                      { value: "highestPrice", label: "Highest Price" },
                      { value: "lowestPrice", label: "Lowest Price" },
                      { value: "longestDuration", label: "Longest Duration" },
                      { value: "shortestDuration", label: "Shortest Duration" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={styles.filterOptionItem}
                        onClick={() => updateTempFilter("sortBy", tempFilters.sortBy === opt.value ? "" : opt.value)}
                      >
                        <span className={`${styles.tickIcon} ${tempFilters.sortBy === opt.value ? styles.tickIconActive : ""}`}>
                          {tempFilters.sortBy === opt.value && <Icons.Check size={16} />}
                        </span>
                        <span className={styles.filterOptionLabel}>{opt.label}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.filterModalFooter}>
              <button className={styles.filterResetBtn} onClick={resetFilters}>Reset</button>
              <button className={styles.filterApplyBtn} onClick={applyFilters}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationHistory;
