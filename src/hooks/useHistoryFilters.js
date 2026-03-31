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
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState(INITIAL_FILTERS);
  const [activeFilterTab, setActiveFilterTab] = useState("Type");
  const debounceRef = useRef(null);

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value.trim() }));
      setPage(1);
    }, 500);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters((prev) => ({ ...prev, search: searchQuery.trim() }));
    setPage(1);
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters((prev) => ({ ...prev, search: "" }));
    setPage(1);
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
    // Validate custom dates
    const { customFromDate, customToDate } = tempFilters;
    if ((customFromDate && !customToDate) || (!customFromDate && customToDate)) {
      return; // Both must be provided
    }
    setFilters(tempFilters);
    setPage(1);
    setShowFilterModal(false);
  }, [tempFilters]);

  const resetFilters = useCallback(() => {
    setTempFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setSearchQuery("");
    setPage(1);
    setShowFilterModal(false);
  }, []);

  const updateTempFilter = useCallback((key, value) => {
    setTempFilters((prev) => {
      // If selecting dateRange, clear custom dates and vice versa
      if (key === "dateRange" && value) {
        return { ...prev, dateRange: value, customFromDate: "", customToDate: "" };
      }
      if ((key === "customFromDate" || key === "customToDate") && value) {
        return { ...prev, [key]: value, dateRange: "" };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  // Build query params for API calls
  const queryParams = {
    page,
    limit: 10,
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.filterBy && { filterBy: filters.filterBy }),
    ...(filters.search && { search: filters.search }),
    ...(filters.dateRange && { dateRange: filters.dateRange }),
    ...(filters.customFromDate && { customFromDate: filters.customFromDate }),
    ...(filters.customToDate && { customToDate: filters.customToDate }),
  };

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
    page,
    setPage,
    searchQuery,
    filters,
    tempFilters,
    queryParams,
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
