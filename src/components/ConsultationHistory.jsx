import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { Link } from "react-router";
import { useGetOrderHistoryQuery } from "../redux/oderHistory/orderHistory";
// Import default profile image
import defaultProfileImage from "../assets/images/astrologer-1.jpg";

const formatDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).replace(',', ',');
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
    const date = formatDateHeader(item.createdAt);
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

  const { data, isLoading, isFetching, isError } = useGetOrderHistoryQuery({
    page,
    limit: 10,
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          pages.push('...');
        }
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Loading state
  if (isLoading && page === 1) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gray-900 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm text-gray-500">Loading consultation history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-500 mb-3 sm:mb-4">
            <Icons.AlertCircle size={40} className="mx-auto sm:w-12 sm:h-12" />
          </div>
          <p className="text-sm sm:text-base text-red-500 font-medium mb-2">Failed to load history</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-black text-white rounded-lg text-xs sm:text-sm active:bg-gray-800"
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
      <div className="h-screen flex flex-col -mx-4 -mt-4">
        <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm border-b border-gray-100">
          <Link to="/dashboard">
            <button className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors">
              <Icons.ChevronLeft size={22} className="text-gray-700" />
            </button>
          </Link>
          <h1 className="text-sm font-semibold text-gray-900">Consultation History</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-gray-300 mb-3 sm:mb-4">
              <Icons.FileText size={48} className="mx-auto sm:w-16 sm:h-16" />
            </div>
            <p className="text-sm sm:text-base text-gray-500 font-medium mb-1">No consultation history</p>
            <p className="text-xs sm:text-sm text-gray-400">Your consultations will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white px-4 py-3 sticky top-0 z-10 shadow-sm border-b border-gray-100 -mx-4 -mt-4 mb-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <button className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:bg-gray-200 transition-colors">
              <Icons.ChevronLeft size={22} className="text-gray-700" />
            </button>
          </Link>
          <h1 className="text-sm font-semibold text-gray-900">
            Consultation History
          </h1>
        </div>
      </header>

    <div className="min-h-screen bg-gray-50 flex flex-col -mx-4 -mb-4">
      {/* Main Content */}
      <main className="flex-1 pb-6">
        {/* Orders Count and Actions */}
        <div className="px-5 sm:px-4 py-3 sm:py-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <h2 className="text-[15px] sm:text-xl font-semibold text-gray-700">
            {data?.data?.pagination?.totalItems || 0} Orders
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 rounded-full text-[11px] sm:text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100">
              <Icons.Filter size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 rounded-full text-[11px] sm:text-sm font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100">
              <Icons.ArrowUpDown size={14} className="sm:w-[18px] sm:h-[18px]" />
              <span>Sort By</span>
            </button>
          </div>
        </div>

      {/* List grouped by date */}
      <div className="px-5 sm:px-6 space-y-4 sm:space-y-6 mb-6">
        {Object.entries(groupByDate(transactions)).map(([date, items]) => (
          <div key={date} className="max-w-4xl">
            {/* Date Header - Left Aligned */}
            <h3 className="text-[18px] sm:text-[22px] font-bold text-gray-600 mb-3 sm:mb-5 text-left">{date}</h3>

            {/* Items for this date */}
            <div className="space-y-2.5 sm:space-y-4">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-white rounded-[16px] sm:rounded-[20px] shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order ID and Menu */}
                  <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-gray-100">
                    <span className="text-[15px] sm:text-[20px] font-bold text-gray-700">
                      #{index + 1 + (page - 1) * 10}
                    </span>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === item._id ? null : item._id)
                        }
                        className="p-1 sm:p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Icons.MoreVertical size={18} className="text-gray-600 sm:w-[22px] sm:h-[22px]" />
                      </button>

                      {openMenuId === item._id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                          <button
                            onClick={() => {
                              setRefundItem(item);
                              setRefundAmount("");
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                          >
                            Refund
                          </button>
                          <button
                            onClick={() => {
                              console.log("Total Refund", item._id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors border-t border-gray-100"
                          >
                            Total Refund
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-3 sm:p-5 flex gap-3 sm:gap-4 items-center">
                    {/* Profile Image - Vertically Centered */}
                    <div className="flex-shrink-0">
                      <div className="w-[90px] h-[95px] sm:w-[130px] sm:h-[140px] rounded-[20px] sm:rounded-[28px] bg-gray-200 overflow-hidden shadow-sm">
                        <img
                          src={item.displayProfile?.profileImage || defaultProfileImage}
                          alt={item.displayProfile?.name || "User"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultProfileImage;
                          }}
                        />
                      </div>
                    </div>

                    {/* Details - Full Width Container */}
                    <div className="flex-1 min-w-0">
                      {/* Stars and Call Button Row */}
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="flex gap-0.5 sm:gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= (item.rating || 0);
                            
                            return (
                              <div key={star}>
                                <Icons.Star
                                  size={18}
                                  strokeWidth={2}
                                  className={`sm:w-[28px] sm:h-[28px] ${
                                    isFilled
                                      ? "fill-orange-400 text-orange-400"
                                      : "fill-none text-orange-400"
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                        {item.type === "call" && (
                          <button className="w-[42px] h-[42px] sm:w-[56px] sm:h-[56px] rounded-[14px] sm:rounded-[20px] bg-orange-50 flex items-center justify-center hover:bg-orange-100 active:bg-orange-200 flex-shrink-0 transition-colors">
                            <Icons.Phone size={20} className="text-orange-600 sm:w-[28px] sm:h-[28px]" strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {/* Name - Left Aligned */}
                      <h4 className="text-[14px] sm:text-[24px] font-medium text-gray-800 leading-tight mb-1.5 sm:mb-2 text-left">
                        {item.displayProfile?.name || "Unknown User"}
                      </h4>

                      {/* Date and Time Row - Left Aligned */}
                      <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Icons.Calendar size={16} className="text-orange-500 flex-shrink-0 sm:w-5 sm:h-5" strokeWidth={2} />
                          <span className="text-[14px] sm:text-[16px] text-gray-500 font-normal whitespace-nowrap">{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Icons.Clock size={16} className="text-orange-500 flex-shrink-0 sm:w-5 sm:h-5" strokeWidth={2} />
                          <span className="text-[14px] sm:text-[16px] text-gray-500 font-normal whitespace-nowrap">{formatTime(item.createdAt)}</span>
                        </div>
                      </div>

                      {/* Duration - Only show if exists */}
                      {item.sessionDetails?.durationSeconds !== null && item.sessionDetails?.durationSeconds !== undefined && (
                        <p className="text-[14px] sm:text-[16px] text-gray-500 font-normal mb-1.5 sm:mb-2 text-left">
                          Duration : {formatDuration(item.sessionDetails?.durationSeconds)}
                        </p>
                      )}

                      {/* Amount - Left Aligned */}
                      <p className="text-[14px] sm:text-[28px] font-medium text-gray-800 leading-none text-left">
                        ₹{item.billing?.astrologer?.creditAmount || item.sessionDetails?.amount || 0}
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing <span className="font-semibold">{((pagination.currentPage - 1) * 10) + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(pagination.currentPage * 10, pagination.totalItems)}
                </span>{' '}
                of <span className="font-semibold">{pagination.totalItems}</span> results
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage || isFetching}
                  className="flex-shrink-0 px-3 py-2 rounded-lg border-2 border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <Icons.ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        disabled={isFetching}
                        className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          pageNum === pagination.currentPage
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage || isFetching}
                  className="flex-shrink-0 px-3 py-2 rounded-lg border-2 border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <Icons.ChevronRight size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isFetching && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Refund Amount</h3>

            <input
              type="number"
              placeholder="Enter refund amount"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 mb-5 sm:mb-6 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRefundItem(null)}
                className="flex-1 px-4 py-2.5 sm:py-3 text-sm font-medium border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 active:bg-gray-100"
              >
                Cancel
              </button>

              <button
                disabled={!refundAmount}
                onClick={() => {
                  console.log("Refund:", refundAmount, refundItem._id);
                  setRefundItem(null);
                }}
                className="flex-1 px-4 py-2.5 sm:py-3 text-sm font-medium bg-orange-500 text-white rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 active:bg-orange-700"
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
