import { Icons } from "../../../components/Icons";
import { AppDefaultImg, AppIcons } from "../../../utils/appImages";
import Pagination from "../../../components/UI/pagination/Pagination";
import dayjs from "dayjs";
import styles from "./OrderHistory.module.scss";

const formatDate = (iso) => dayjs(iso).format("MMM D, YYYY");

const formatTime = (iso) => dayjs(iso).format("hh:mm A");

const formatDuration = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} Min ${secs} Secs`;
};

const OrderHistory = ({
  transactions,
  groupByDate,
  pagination,
  isLoading,
  isError,
  isFetching,
  hasActiveFilters,
  openMenuId,
  setOpenMenuId,
  setRefundItem,
  setRefundMinutes,
  setRefundType,
  setPage,
  onResetFilters,
  onNavigate,
}) => {
  return (
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
          <button className={styles.resetButton} onClick={onResetFilters}>
            <Icons.X size={14} />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {!isError &&
        Object.entries(groupByDate(transactions)).map(([date, items]) => (
          <div key={date} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>{date}</h3>

            <div className={styles.itemsList}>
              {items.map((item) => (
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
                            openMenuId === item._id ? null : item._id
                          )
                        }
                        className={styles.menuButton}
                      >
                        <Icons.MoreVertical size={18} />
                      </button>

                      {openMenuId === item._id && (
                        <div className={styles.menuDropdown}>
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
                                      ? { opacity: 0.4, pointerEvents: "none" }
                                      : {}
                                  }
                                  disabled={!isRefundEnabled}
                                >
                                  Refund
                                </button>
                                <button
                                  onClick={() => {
                                    if (!isRefundEnabled) return;
                                    const totalMins = Math.floor(
                                      (item?.sessionDetails?.durationSeconds || 0) / 60
                                    );
                                    setRefundItem(item);
                                    setRefundMinutes(String(totalMins));
                                    setRefundType("total");
                                    setOpenMenuId(null);
                                  }}
                                  className={styles.menuItemDanger}
                                  style={
                                    !isRefundEnabled
                                      ? { opacity: 0.4, pointerEvents: "none" }
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
                    onClick={() => onNavigate(item?.type, item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.profileImageContainer}>
                      <div className={styles.profileImage}>
                        <img
                          src={
                            item.displayProfile?.profileImage ||
                            AppDefaultImg.DefaultMaleAstrologer
                          }
                          alt={item.displayProfile?.name || "User"}
                          onError={(e) => {
                            e.target.src = AppDefaultImg.DefaultMaleAstrologer;
                          }}
                        />
                      </div>
                    </div>

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
                            <stop offset="0%" stopColor="var(--main-primary-start)" />
                            <stop offset="100%" stopColor="var(--main-primary-end)" />
                          </linearGradient>
                        </defs>
                      </svg>

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
                                  isFilled ? styles.starFilled : styles.starEmpty
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

                      <h4 className={styles.userName}>
                        {item.displayProfile?.name || "Unknown User"}
                      </h4>

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

                      <p className={styles.duration}>
                        Duration : {formatDuration(item.sessionDetails?.durationSeconds)}
                      </p>

                      <p className={styles.amount}>
                        ₹{item.billing?.astrologer?.creditAmount || item.sessionDetails?.amount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Pagination */}
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
  );
};

export default OrderHistory;
