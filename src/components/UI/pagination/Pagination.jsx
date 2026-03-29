import { Icons } from "../../Icons";
import styles from "./Pagination.module.scss";

/**
 * Reusable Pagination component
 * @param {Object} props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.limit - Items per page (default: 10)
 * @param {boolean} props.hasPreviousPage - Whether previous page exists
 * @param {boolean} props.hasNextPage - Whether next page exists
 * @param {function} props.onPageChange - Callback when page changes
 * @param {boolean} props.disabled - Disable all buttons (e.g. during fetch)
 * @param {number} props.maxPagesToShow - Max page buttons to show (default: 5)
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit = 10,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  disabled = false,
  maxPagesToShow = 5,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (currentPage <= 3) end = maxPagesToShow;
      else if (currentPage >= totalPages - 2) start = totalPages - maxPagesToShow + 1;

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalItems);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.pageInfo}>
          Showing <span>{from}</span> to <span>{to}</span> of <span>{totalItems}</span> results
        </div>
        <div className={styles.buttons}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage || disabled}
            className={styles.navButton}
          >
            <Icons.ChevronLeft size={16} />
          </button>

          <div className={styles.pageNumbers}>
            {getPageNumbers().map((pageNum, index) =>
              pageNum === "..." ? (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={disabled}
                  className={pageNum === currentPage ? styles.pageActive : styles.pageInactive}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage || disabled}
            className={styles.navButton}
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
