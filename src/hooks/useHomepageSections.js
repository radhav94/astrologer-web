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
  if (isError && import.meta.env.DEV) {
    console.warn('[useHomepageSections] Failed to fetch homepage sections:', error);
  }

  /**
   * Client-only sections that are not managed by the API.
   * These are always appended after the API-driven sections.
   */
  const CLIENT_ONLY_TYPES = useMemo(() => new Set([
    SECTION_TYPES.QUICK_STATS,
    SECTION_TYPES.WALLET,
    SECTION_TYPES.RECENT_ACTIVITY,
    SECTION_TYPES.PROFILE_COMPLETION,
    SECTION_TYPES.GREETING_BANNER,
    SECTION_TYPES.QUICK_ACTIONS,
    SECTION_TYPES.GIFT_SUMMARY,
  ]), []);

  /**
   * Get ordered and filtered sections from API
   * Falls back to default sections if API fails or returns empty
   * Client-only sections are always appended after API sections
   */
  const orderedSections = useMemo(() => {
    // Use default sections if API hasn't loaded, errored, or returned empty
    if (isError || sections.length === 0) {
      return DEFAULT_SECTIONS;
    }

    // Filter active sections and sort by list_order
    const apiSections = sections
      .filter((section) => section.status !== false)
      .sort((a, b) => (a.list_order || 0) - (b.list_order || 0));

    // Determine which client-only sections are missing from the API response
    const apiTypes = new Set(apiSections.map((s) => s.display_type));
    const clientSections = DEFAULT_SECTIONS
      .filter((s) => CLIENT_ONLY_TYPES.has(s.display_type) && !apiTypes.has(s.display_type));

    // Insert client sections at strategic positions based on anchor sections
    // Each client section has a preferred "after" anchor from the API sections
    const anchorMap = {
      [SECTION_TYPES.GREETING_BANNER]: null, // always first
      [SECTION_TYPES.PROFILE_COMPLETION]: SECTION_TYPES.GREETING_BANNER,
      [SECTION_TYPES.QUICK_ACTIONS]: SECTION_TYPES.TODAYS_UPDATES,
      [SECTION_TYPES.QUICK_STATS]: SECTION_TYPES.QUICK_ACTIONS,
      [SECTION_TYPES.WALLET]: SECTION_TYPES.CONSULTATION_PRICE,
      [SECTION_TYPES.GIFT_SUMMARY]: SECTION_TYPES.MONTHLY_OVERVIEW,
      [SECTION_TYPES.RECENT_ACTIVITY]: SECTION_TYPES.GIFT_SUMMARY,
    };

    const result = [...apiSections];

    clientSections.forEach((cs) => {
      const anchor = anchorMap[cs.display_type];

      if (anchor === null) {
        // Insert at the very beginning
        result.splice(0, 0, cs);
        return;
      }

      const anchorIdx = result.findIndex((r) => r.display_type === anchor);
      if (anchorIdx !== -1) {
        result.splice(anchorIdx + 1, 0, cs);
      } else {
        // Fallback: use DEFAULT_SECTIONS ordering
        const defaultIdx = DEFAULT_SECTIONS.findIndex((d) => d.display_type === cs.display_type);
        let insertAt = result.length;
        for (let i = defaultIdx - 1; i >= 0; i--) {
          const prevType = DEFAULT_SECTIONS[i].display_type;
          const existingIdx = result.findIndex((r) => r.display_type === prevType);
          if (existingIdx !== -1) {
            insertAt = existingIdx + 1;
            break;
          }
        }
        result.splice(insertAt, 0, cs);
      }
    });

    return result;
  }, [sections, isError, CLIENT_ONLY_TYPES]);

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
