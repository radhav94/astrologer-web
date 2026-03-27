import { useEffect, useState, useRef, useCallback } from "react";
import { Icons } from "../../../components/Icons";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import {
  useGetOrderHistoryQuery,
  useRefundInitiateByAstrologerMutation,
  useGetWithdrawalHistoryQuery,
} from "../../../redux/oderHistory/orderHistory";
// Import default profile image
import { AppDefaultImg, AppIcons } from "../../../utils/appImages";
import SectionHeader from "../../../components/UI/SectionHeader";
import Pagination from "../../../components/UI/pagination/Pagination";
import styles from "./ConsultationHistory.module.scss";
import dayjs from "dayjs";
import { PATH } from "../../../utils/routes/Paths";
import useChat from "../../../hooks/useChatWindow";
import { useSelector } from "react-redux";
import { Toast } from "../../../components";
// const { activeChat } = useChat();

const formatDate = (iso) => {
  const date = new Date(iso);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .replace(",", ",");
};

const formatDateHeader = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

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

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const FILTER_CATEGORIES = ["Type", "Month", "Year", "Sorting"];

const ConsultationHistory = () => {
  // Withdrawal tab moved to Profile.jsx — keeping state for reference
  // const [activeTab, setActiveTab] = useState("Transaction");
  // const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [refundItem, setRefundItem] = useState(null);
  // Old: amount-based refund input
  // const [refundAmount, setRefundAmount] = useState("");
  // New: minutes-based refund input (system calculates amount internally)
  const [refundMinutes, setRefundMinutes] = useState("");
  // Track refund type: "partial" for Refund, "total" for Total Refund
  const [refundType, setRefundType] = useState("partial");
  const [sortOrder, setSortOrder] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);

  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("Type");
  // Temp filter state (applied only on "Apply")
  const [tempFilterBy, setTempFilterBy] = useState("");
  const [tempSortOrder, setTempSortOrder] = useState("");
  const [tempMonth, setTempMonth] = useState([]);
  const [tempYear, setTempYear] = useState([]);

  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const openFilterModal = () => {
    setTempFilterBy(filterBy);
    setTempSortOrder(sortOrder);
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    setActiveFilterTab("Type");
    setShowFilterModal(true);
  };

  const applyFilters = () => {
    setFilterBy(tempFilterBy);
    setSortOrder(tempSortOrder);
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setPage(1);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setTempFilterBy("");
    setTempSortOrder("");
    setTempMonth([]);
    setTempYear([]);
    setFilterBy("");
    setSortOrder("");
    setSelectedMonth([]);
    setSelectedYear([]);
    setPage(1);
    setShowFilterModal(false);
  };

  const activeFilterCount = [
    filterBy ? 1 : 0,
    sortOrder ? 1 : 0,
    selectedMonth ? 1 : 0,
    selectedYear ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Debounced search: updates searchText after 500ms of inactivity
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchText(value.trim());
      setPage(1);
    }, 500);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Old: no refetch on remount — stale cached data shown after session ends
  // const { data, isLoading, isFetching, isError } = useGetOrderHistoryQuery({
  //   page,
  //   limit: 10,
  //   sortOrder,
  //   filterBy,
  // });

  // New: refetchOnMountOrArgChange ensures fresh data when navigating back
  const { data, isLoading, isFetching, isError } = useGetOrderHistoryQuery({
    page,
    limit: 10,
    sortOrder,
    filterBy,
    ...(searchText && { search: searchText }),
    ...(selectedMonth.length > 0 && { month: selectedMonth.join(",") }),
    ...(selectedYear.length > 0 && { year: selectedYear.join(",") }),
  }, {
    refetchOnMountOrArgChange: true,
  });

  const astrologerDetails = useSelector(
    (state) => state.register?.astrologerDetails,
  );

  // Withdrawal query moved to Profile.jsx → WithdrawalsList component
  // const {
  //   data: withdrawalData,
  //   isLoading: isWithdrawalLoading,
  //   isFetching: isWithdrawalFetching,
  // } = useGetWithdrawalHistoryQuery(
  //   { page: withdrawalPage, limit: 10 },
  //   { skip: activeTab === "Transaction", refetchOnMountOrArgChange: true },
  // );
  // const withdrawalsRaw = withdrawalData?.data?.withdrawals || withdrawalData?.data?.data || withdrawalData?.data;
  // const withdrawals = Array.isArray(withdrawalsRaw) ? withdrawalsRaw : [];
  // const withdrawalPagination = withdrawalData?.data?.pagination || withdrawalData?.pagination;

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
  }, [page]);

  const handlePreviousPage = () => {
    if (pagination?.hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const handleNavigation = (type, item) => {
    if (type !== "chat") {
      return;
    }
    navigate(PATH.privateRoutes.CHAT_WINDOW.path.replace(":chatId", item?.id), {
      state: {
        userId: item?.userId,
        astrologerId: item?.astrologerId,
        fullName: item?.displayProfile?.name,
        roomId: null,
        isUserSide: false,
        kundliId: null,
        userID: item?.userId,
      },
    });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (!pagination) return [];

    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with 2 pages on each side
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // New: isLoadingOrFetching flag — used for overlay rendering below
  const isLoadingOrFetching = isLoading || isFetching;

  // Error state
  // Track whether any search/filter is active
  const hasActiveFilters = searchText || selectedMonth.length > 0 || selectedYear.length > 0 || filterBy || sortOrder;

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
        <SectionHeader title={"Order History"} />
        <h2 className={styles.ordersCount}>
          Total Orders: {data?.data?.pagination?.totalItems || 0}
        </h2>
      </div>

      <div className={styles.mainContainer}>
        <main className={styles.mainContent}>
          {/* Orders Count and Actions */}
          <div className={styles.ordersHeader}>
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
                    if (e.key === "Enter") {
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      setSearchText(searchQuery.trim());
                      setPage(1);
                    }
                  }}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    className={styles.searchClear}
                    onClick={() => {
                      setSearchQuery("");
                      if (debounceRef.current) clearTimeout(debounceRef.current);
                      setSearchText("");
                      setPage(1);
                    }}
                  >
                    <Icons.X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                className={styles.filterButton}
                onClick={openFilterModal}
              >
                <Icons.Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* List grouped by date */}
          <div className={styles.listContainer}>
            {/* Inline empty/error state when filters produce no results */}
            {!isLoading && (transactions.length === 0 || isError) && hasActiveFilters && (
              <div className={styles.noResultsContainer}>
                <div className={styles.emptyIcon}>
                  <Icons.FileText size={48} />
                </div>
                <p className={styles.emptyTitle}>No results found</p>
                <p className={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </p>
                <button
                  className={styles.resetButton}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchText("");
                    setSelectedMonth([]);
                    setSelectedYear([]);
                    setFilterBy("");
                    setSortOrder("");
                    setPage(1);
                  }}
                >
                  <Icons.X size={14} />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}

            {!isError && Object.entries(groupByDate(transactions)).map(([date, items]) => (
              <div key={date} className={styles.dateGroup}>
                {/* Date Header - Left Aligned */}
                <h3 className={styles.dateHeader}>{date}</h3>

                {/* Items for this date */}
                <div className={styles.itemsList}>
                  {items.map((item, index) => {
                    return (
                      <div key={item._id} className={styles.orderCard}>
                        {/* Order ID and Menu */}
                        <div className={styles.orderHeader}>
                          <span className={styles.orderNumber}>
                            #{item?._id?.slice(-4)}
                          </span>
                          <div
                            className={styles.menuContainer}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === item._id ? null : item._id,
                                )
                              }
                              className={styles.menuButton}
                            >
                              <Icons.MoreVertical size={18} />
                            </button>

                            {openMenuId === item._id && (
                              <div className={styles.menuDropdown}>
                                {/* Refund actions: disabled when durationSeconds is null or 0 */}
                                {(() => {
                                  const isRefundEnabled =
                                    item?.sessionDetails?.durationSeconds > 0;
                                  return (
                                    <>
                                      <button
                                        onClick={() => {
                                          if (!isRefundEnabled) return;
                                          setRefundItem(item);
                                          setRefundMinutes("");
                                          setRefundType("partial");
                                          setOpenMenuId(null);
                                        }}
                                        className={styles.menuItem}
                                        style={
                                          !isRefundEnabled
                                            ? {
                                                opacity: 0.4,
                                                pointerEvents: "none",
                                              }
                                            : {}
                                        }
                                        disabled={!isRefundEnabled}
                                      >
                                        Refund
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (!isRefundEnabled) return;
                                          // Total Refund: pre-fill with full session duration in minutes
                                          const totalMins = Math.floor(
                                            (item?.sessionDetails
                                              ?.durationSeconds || 0) / 60,
                                          );
                                          setRefundItem(item);
                                          setRefundMinutes(String(totalMins));
                                          setRefundType("total");
                                          setOpenMenuId(null);
                                        }}
                                        className={styles.menuItemDanger}
                                        style={
                                          !isRefundEnabled
                                            ? {
                                                opacity: 0.4,
                                                pointerEvents: "none",
                                              }
                                            : {}
                                        }
                                        disabled={!isRefundEnabled}
                                      >
                                        Total Refund
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Main Content */}
                        <div
                          className={styles.orderContent}
                          onClick={() => handleNavigation(item?.type, item)}
                          style={{
                            cursor:
                              item?.type == "chat" ? "pointer" : "default",
                          }}
                        >
                          {/* Profile Image - Vertically Centered */}
                          <div className={styles.profileImageContainer}>
                            <div className={styles.profileImage}>
                              <img
                                src={
                                  item.displayProfile?.profileImage ||
                                  AppDefaultImg.DefaultMaleAstrologer
                                }
                                alt={item.displayProfile?.name || "User"}
                                onError={(e) => {
                                  e.target.src = defaultProfileImage;
                                }}
                              />
                            </div>
                          </div>

                          {/* Details - Full Width Container */}
                          <div className={styles.detailsContainer}>
                            <svg width="0" height="0">
                              <defs>
                                <linearGradient
                                  id="starGradient"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="var(--main-primary-start)"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="var(--main-primary-end)"
                                  />
                                </linearGradient>
                              </defs>
                            </svg>
                            {/* Stars and Call Button Row */}
                            <div className={styles.starsAndCallRow}>
                              <div className={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const isFilled = star <= (item?.rating || 0);

                                  return (
                                    <Icons.Star
                                      key={star}
                                      size={20}
                                      strokeWidth={2}
                                      className={`${styles.star} ${
                                        isFilled
                                          ? styles.starFilled
                                          : styles.starEmpty
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                              {item.type === "call" && (
                                <button className={styles.callButton}>
                                  <img src={AppIcons.Call1} alt="call" />
                                </button>
                              )}
                              {item.type === "chat" && (
                                <button className={styles.callButton}>
                                  <img src={AppIcons.Chat1} alt="chat" />
                                </button>
                              )}
                              {item.type === "video" && (
                                <button className={styles.callButton}>
                                  <img src={AppIcons.Video1Icon} alt="video" />
                                </button>
                              )}
                            </div>

                            {/* Name - Left Aligned */}
                            <h4 className={styles.userName}>
                              {item.displayProfile?.name || "Unknown User"}
                            </h4>

                            {/* Date and Time Row - Left Aligned */}
                            <div className={styles.dateTimeRow}>
                              <div className={styles.dateTimeItem}>
                                <Icons.Calendar size={16} strokeWidth={2} />
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                              <div className={styles.dateTimeItem}>
                                <Icons.Clock size={16} strokeWidth={2} />
                                <span>{formatTime(item.createdAt)}</span>
                              </div>
                            </div>

                            {/* Duration - Only show if exists */}
                            {/* {item.sessionDetails?.durationSeconds && ( */}
                            <p className={styles.duration}>
                              Duration :{" "}
                              {formatDuration(
                                item.sessionDetails?.durationSeconds,
                              )}
                            </p>
                            {/* )} */}

                            {/* Amount - Left Aligned */}
                            <p className={styles.amount}>
                              ₹
                              {item.billing?.astrologer?.creditAmount ||
                                item.sessionDetails?.amount ||
                                0}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {!isError && (
              <Pagination
                currentPage={pagination?.currentPage}
                totalPages={pagination?.totalPages}
                totalItems={pagination?.totalItems}
                limit={10}
                hasPreviousPage={pagination?.hasPreviousPage}
                hasNextPage={pagination?.hasNextPage}
                onPageChange={setPage}
                disabled={isFetching}
              />
            )}

            
          </div>

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

      {/* Loading Overlay — shown during isLoading or isFetching */}
      {isLoadingOrFetching && (
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
                {FILTER_CATEGORIES.map((cat) => (
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
                      <span>Select Type</span>
                    </div>
                    {["call", "chat"].map((type) => (
                      <div
                        key={type}
                        className={styles.filterOptionItem}
                        onClick={() => setTempFilterBy(tempFilterBy === type ? "" : type)}
                      >
                        <span className={`${styles.tickIcon} ${tempFilterBy === type || tempFilterBy === "all" ? styles.tickIconActive : ""}`}>
                          {(tempFilterBy === type || tempFilterBy === "all") && <Icons.Check size={16} />}
                        </span>
                        <span className={styles.filterOptionLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </div>
                    ))}
                  </>
                )}

                {activeFilterTab === "Month" && (
                  <>
                    <div className={styles.filterOptionHeader}>
                      <span>Select Month</span>
                      <button className={styles.filterSelectAll} onClick={() => setTempMonth(MONTHS.map(m => m.value))}>Select all</button>
                    </div>
                    {MONTHS.map((m) => (
                      <div
                        key={m.value}
                        className={styles.filterOptionItem}
                        onClick={() => setTempMonth(prev => prev.includes(m.value) ? prev.filter(v => v !== m.value) : [...prev, m.value])}
                      >
                        <span className={`${styles.tickIcon} ${tempMonth.includes(m.value) ? styles.tickIconActive : ""}`}>
                          {tempMonth.includes(m.value) && <Icons.Check size={16} />}
                        </span>
                        <span className={styles.filterOptionLabel}>{m.label}</span>
                      </div>
                    ))}
                  </>
                )}

                {activeFilterTab === "Year" && (
                  <>
                    <div className={styles.filterOptionHeader}>
                      <span>Select Year</span>
                      <button className={styles.filterSelectAll} onClick={() => setTempYear(Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i)))}>Select all</button>
                    </div>
                    {Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i)).map((yr) => (
                      <div
                        key={yr}
                        className={styles.filterOptionItem}
                        onClick={() => setTempYear(prev => prev.includes(yr) ? prev.filter(v => v !== yr) : [...prev, yr])}
                      >
                        <span className={`${styles.tickIcon} ${tempYear.includes(yr) ? styles.tickIconActive : ""}`}>
                          {tempYear.includes(yr) && <Icons.Check size={16} />}
                        </span>
                        <span className={styles.filterOptionLabel}>{yr}</span>
                      </div>
                    ))}
                  </>
                )}

                {activeFilterTab === "Sorting" && (
                  <>
                    <div className={styles.filterOptionHeader}>
                      <span>Sort Order</span>
                    </div>
                    {[
                      { value: "desc", label: "Sort By Ascending Order" },
                      { value: "asc", label: " Sort By Descending Order" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={styles.filterOptionItem}
                        onClick={() => setTempSortOrder(tempSortOrder === opt.value ? "" : opt.value)}
                      >
                        <span className={`${styles.tickIcon} ${tempSortOrder === opt.value ? styles.tickIconActive : ""}`}>
                          {tempSortOrder === opt.value && <Icons.Check size={16} />}
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
