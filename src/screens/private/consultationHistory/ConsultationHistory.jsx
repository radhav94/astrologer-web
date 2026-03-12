import { useEffect, useState } from "react";
import { Icons } from "../../../components/Icons";
import { Link } from "react-router";
import { useGetOrderHistoryQuery } from "../../../redux/oderHistory/orderHistory";
// Import default profile image
import { AppDefaultImg, AppIcons } from "../../../utils/appImages";
import SectionHeader from "../../../components/UI/SectionHeader";
import styles from "./ConsultationHistory.module.scss";
import dayjs from "dayjs";

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

const ConsultationHistory = () => {
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [refundItem, setRefundItem] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("call");

  const { data, isLoading, isFetching, isError } = useGetOrderHistoryQuery({
    page,
    limit: 10,
    sortOrder,
    filterBy,
  });

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

  // Loading state
  if (isLoading && page === 1) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading consultation history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
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

  // Empty state
  if (!isLoading && transactions.length === 0) {
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
      </div>

      <div className={styles.mainContainer}>
        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Orders Count and Actions */}
          <div className={styles.ordersHeader}>
            <h2 className={styles.ordersCount}>
              {data?.data?.pagination?.totalItems || 0} Orders
            </h2>
            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={() =>
                  setFilterBy((prev) => (prev === "call" ? "chat" : "call"))
                }
              >
                <Icons.Filter size={14} />
                <span>Filter</span>
              </button>
              <button
                className={styles.actionButton}
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                <Icons.ArrowUpDown size={14} />
                <span>Sort By</span>
              </button>
            </div>
          </div>

          {/* List grouped by date */}
          <div className={styles.listContainer}>
            {Object.entries(groupByDate(transactions)).map(([date, items]) => (
              <div key={date} className={styles.dateGroup}>
                {/* Date Header - Left Aligned */}
                <h3 className={styles.dateHeader}>{date}</h3>

                {/* Items for this date */}
                <div className={styles.itemsList}>
                  {items.map((item, index) => (
                    <div key={item._id} className={styles.orderCard}>
                      {/* Order ID and Menu */}
                      <div className={styles.orderHeader}>
                        <span className={styles.orderNumber}>
                          #{index + 1 + (page - 1) * 10}
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
                              <button
                                onClick={() => {
                                  setRefundItem(item);
                                  setRefundAmount("");
                                  setOpenMenuId(null);
                                }}
                                className={styles.menuItem}
                              >
                                Refund
                              </button>
                              <button
                                onClick={() => {
                                  // console.log("Total Refund", item._id);
                                  setOpenMenuId(null);
                                }}
                                className={styles.menuItemDanger}
                              >
                                Total Refund
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className={styles.orderContent}>
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
                            {item.type === "call" ? (
                              <button className={styles.callButton}>
                                <img src={AppIcons.Call1} alt="call" />
                              </button>
                            ) : (
                              <button className={styles.callButton}>
                                <img src={AppIcons.Chat1} alt="chat" />
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
                          {item.sessionDetails?.durationSeconds !== null &&
                            item.sessionDetails?.durationSeconds !==
                              undefined && (
                              <p className={styles.duration}>
                                Duration :{" "}
                                {formatDuration(
                                  item.sessionDetails?.durationSeconds,
                                )}
                              </p>
                            )}

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
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationContent}>
                  {/* Page Info */}
                  <div className={styles.pageInfo}>
                    Showing <span>{(pagination.currentPage - 1) * 10 + 1}</span>{" "}
                    to{" "}
                    <span>
                      {Math.min(
                        pagination.currentPage * 10,
                        pagination.totalItems,
                      )}
                    </span>{" "}
                    of <span>{pagination.totalItems}</span> results
                  </div>

                  {/* Pagination Buttons */}
                  <div className={styles.paginationButtons}>
                    {/* Previous Button */}
                    <button
                      onClick={handlePreviousPage}
                      disabled={!pagination.hasPreviousPage || isFetching}
                      className={styles.paginationButton}
                    >
                      <Icons.ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    <div className={styles.pageNumbers}>
                      {getPageNumbers().map((pageNum, index) =>
                        pageNum === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className={styles.ellipsis}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageClick(pageNum)}
                            disabled={isFetching}
                            className={
                              pageNum === pagination.currentPage
                                ? styles.pageNumberButtonActive
                                : styles.pageNumberButtonInactive
                            }
                          >
                            {pageNum}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage || isFetching}
                      className={styles.paginationButton}
                    >
                      <Icons.ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isFetching && (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingSpinner}></div>
              </div>
            )}
          </div>

          {/* Refund Modal */}
          {refundItem && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Refund Amount</h3>

                <input
                  type="number"
                  placeholder="Enter refund amount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className={styles.modalInput}
                />

                <div className={styles.modalButtons}>
                  <button
                    onClick={() => setRefundItem(null)}
                    className={styles.modalCancelButton}
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!refundAmount}
                    onClick={() => {
                      console.log("Refund:", refundAmount, refundItem._id);
                      setRefundItem(null);
                    }}
                    className={styles.modalConfirmButton}
                  >
                    Confirm Refund
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ConsultationHistory;
