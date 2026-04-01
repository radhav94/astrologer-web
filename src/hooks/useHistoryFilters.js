import { useState, useCallback, useRef, useEffect } from "react";

const INITIAL_FILTERS = {
  search: "",
  sortBy: "",
  filterBy: "",
  dateRange: "",
  customFromDate: "",
  customToDate: "",
};

const useHistoryFilters = () => {
  const [orderPage, setOrderPage] = useState(1);
  const [txnPage, setTxnPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState(INITIAL_FILTERS);
  const [activeFilterTab, setActiveFilterTab] = useState("Type");
  const debounceRef = useRef(null);

  const resetPages = () => {
    setOrderPage(1);
    setTxnPage(1);
  };

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value.trim() }));
      resetPages();
    }, 500);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters((prev) => ({ ...prev, search: searchQuery.trim() }));
    resetPages();
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters((prev) => ({ ...prev, search: "" }));
    resetPages();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Filter modal
  const openFilterModal = useCallback(() => {
    setTempFilters(filters);
    setActiveFilterTab("Type");
    setShowFilterModal(true);
  }, [filters]);

  const applyFilters = useCallback(() => {
    const { customFromDate, customToDate } = tempFilters;
    if ((customFromDate && !customToDate) || (!customFromDate && customToDate)) {
      return;
    }
    setFilters(tempFilters);
    resetPages();
    setShowFilterModal(false);
  }, [tempFilters]);

  const resetFilters = useCallback(() => {
    setTempFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setSearchQuery("");
    resetPages();
    setShowFilterModal(false);
  }, []);

  const updateTempFilter = useCallback((key, value) => {
    setTempFilters((prev) => {
      if (key === "dateRange" && value) {
        if (value === "custom") {
          // Keep custom dates, just set dateRange to "custom"
          return { ...prev, dateRange: "custom" };
        }
        // Preset selected — clear custom dates
        return { ...prev, dateRange: value, customFromDate: "", customToDate: "" };
      }
      if ((key === "customFromDate" || key === "customToDate") && value) {
        return { ...prev, [key]: value };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  // Build shared filter params (without page)
  const filterParams = {
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.filterBy && { filterBy: filters.filterBy }),
    ...(filters.search && { search: filters.search }),
    ...(filters.dateRange && filters.dateRange !== "custom" && { dateRange: filters.dateRange }),
    ...(filters.customFromDate && { customFromDate: filters.customFromDate }),
    ...(filters.customToDate && { customToDate: filters.customToDate }),
  };

  // Separate query params per tab
  const orderQueryParams = { page: orderPage, limit: 10, ...filterParams };
  const txnQueryParams = { page: txnPage, limit: 10, ...filterParams };

  const hasActiveFilters = !!(
    filters.search ||
    filters.sortBy ||
    filters.filterBy ||
    filters.dateRange ||
    filters.customFromDate
  );

  const activeFilterCount = [
    filters.filterBy,
    filters.sortBy,
    filters.dateRange,
    filters.customFromDate,
  ].filter(Boolean).length;

  return {
    orderPage,
    setOrderPage,
    txnPage,
    setTxnPage,
    searchQuery,
    filters,
    tempFilters,
    orderQueryParams,
    txnQueryParams,
    hasActiveFilters,
    activeFilterCount,
    showFilterModal,
    activeFilterTab,
    setActiveFilterTab,
    handleSearchChange,
    handleSearchSubmit,
    clearSearch,
    openFilterModal,
    applyFilters,
    resetFilters,
    updateTempFilter,
    setShowFilterModal,
  };
};

export default useHistoryFilters;
