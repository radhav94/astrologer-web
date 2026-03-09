import { useMemo, useCallback } from "react";
import { useGetHomepageSectionsQuery } from "../redux/homepage/homepageApi";
import { SECTION_TYPES, DEFAULT_SECTIONS } from "../constants/sectionTypes";

/**
 * Custom hook to manage homepage sections configuration
 * Provides utilities to check section visibility and extract section content
 * 
 * @returns {Object} Section management utilities
 * @returns {Function} shouldShowSection - Check if a section should be displayed
 * @returns {Array} orderedSections - Sections sorted by list_order from API (for future use)
 * @returns {Array|undefined} tipsContent - Formatted tips content from API
 * @returns {boolean} isLoading - Loading state of the API call
 * @returns {boolean} isError - Error state of the API call
 */
export const useHomepageSections = () => {
  const { data: homepageData, isLoading, isError, error } = useGetHomepageSectionsQuery();
  const sections = homepageData?.data?.list || [];

  // Log errors in development for debugging
  if (isError && process.env.NODE_ENV === 'development') {
    console.warn('[useHomepageSections] Failed to fetch homepage sections:', error);
  }

  /**
   * Get ordered and filtered sections from API
   * Falls back to default sections if API fails or returns empty
   */
  const orderedSections = useMemo(() => {
    // Use default sections if API hasn't loaded, errored, or returned empty
    if (isError || sections.length === 0) {
      return DEFAULT_SECTIONS;
    }

    // Filter active sections and sort by list_order
    return sections
      .filter((section) => section.status !== false)
      .sort((a, b) => (a.list_order || 0) - (b.list_order || 0));
  }, [sections, isError]);

  /**
   * Checks if a section should be displayed based on API configuration
   * Falls back to showing all sections if API fails or returns empty
   * 
   * @param {string} displayType - The section type identifier from SECTION_TYPES
   * @returns {boolean} Whether the section should be shown
   */
  const shouldShowSection = useCallback(
    (displayType) => {
      // Show all sections by default if API hasn't loaded, errored, or returned empty
      if (isError || sections.length === 0) return true;

      const section = sections.find((s) => s.display_type === displayType);
      return section?.status !== false;
    },
    [sections, isError]
  );

  /**
   * Extracts and formats tips content from API response
   * Returns undefined if no tips are available (will use defaults)
   */
  const tipsContent = useMemo(() => {
    const tipsSection = sections.find(
      (s) => s.display_type === SECTION_TYPES.TIPS_AND_GROWTH
    );

    if (!tipsSection?.content?.length) {
      return undefined;
    }

    return tipsSection.content.map((tip, index) => ({
      id: tip._id || `tip-${index}`,
      text: tip.body || tip.title || "",
      title: tip.title,
    }));
  }, [sections]);

  return {
    shouldShowSection,
    orderedSections,
    tipsContent,
    isLoading,
    isError,
  };
};
