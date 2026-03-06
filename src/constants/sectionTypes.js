/**
 * Dashboard section type constants
 * Used to identify and control different dashboard sections via API
 */
export const SECTION_TYPES = {
  CONSULTATION_PRICE: "set-your-consultation-price",
  TODAYS_UPDATES: "todays-updates",
  UPCOMING_SESSIONS: "upcoming-sessions",
  AVAILABILITY_SCHEDULE: "availability-schedule",
  MONTHLY_OVERVIEW: "monthly-overview",
  MILESTONES: "milestones",
  TIPS_AND_GROWTH: "tips-and-growth",
};

/**
 * Default section configuration
 * Used as fallback when API is unavailable
 */
export const DEFAULT_SECTIONS = [
  { display_type: SECTION_TYPES.CONSULTATION_PRICE, status: true, list_order: 1 },
  { display_type: SECTION_TYPES.TODAYS_UPDATES, status: true, list_order: 2 },
  { display_type: SECTION_TYPES.UPCOMING_SESSIONS, status: true, list_order: 3 },
  { display_type: SECTION_TYPES.AVAILABILITY_SCHEDULE, status: true, list_order: 4 },
  { display_type: SECTION_TYPES.MONTHLY_OVERVIEW, status: true, list_order: 5 },
  { display_type: SECTION_TYPES.MILESTONES, status: true, list_order: 6 },
  { display_type: SECTION_TYPES.TIPS_AND_GROWTH, status: true, list_order: 7 },
];
