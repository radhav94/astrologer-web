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
  QUICK_STATS: "quick-stats",
  WALLET: "wallet",
  RECENT_ACTIVITY: "recent-activity",
  PROFILE_COMPLETION: "profile-completion",
  GREETING_BANNER: "greeting-banner",
  QUICK_ACTIONS: "quick-actions",
  GIFT_SUMMARY: "gift-summary",
};

/**
 * Default section configuration — ordered by priority
 *
 * 1. Profile Completion  → nudge to finish setup (auto-hides at 100%)
 * 2. Today's Updates     → live status, earnings, queue (real-time pulse)
 * 3. Quick Stats         → at-a-glance numbers
 * 4. Upcoming Sessions   → who's waiting next
 * 5. Consultation Price  → set / update rates
 * 6. Wallet              → balance & withdraw
 * 7. Monthly Overview    → analytics deep-dive
 * 8. Recent Activity     → transaction feed
 * 9. Milestones          → gamification goals
 * 10. Availability       → calendar setup
 * 11. Tips & Growth      → advice carousel
 */
export const DEFAULT_SECTIONS = [
  { display_type: SECTION_TYPES.GREETING_BANNER, status: true, list_order: 1 },
  { display_type: SECTION_TYPES.PROFILE_COMPLETION, status: true, list_order: 2 },
  { display_type: SECTION_TYPES.TODAYS_UPDATES, status: true, list_order: 3 },
  { display_type: SECTION_TYPES.QUICK_ACTIONS, status: true, list_order: 4 },
  { display_type: SECTION_TYPES.QUICK_STATS, status: true, list_order: 5 },
  { display_type: SECTION_TYPES.UPCOMING_SESSIONS, status: true, list_order: 6 },
  { display_type: SECTION_TYPES.CONSULTATION_PRICE, status: true, list_order: 7 },
  { display_type: SECTION_TYPES.WALLET, status: true, list_order: 8 },
  { display_type: SECTION_TYPES.MONTHLY_OVERVIEW, status: true, list_order: 9 },
  { display_type: SECTION_TYPES.GIFT_SUMMARY, status: true, list_order: 10 },
  { display_type: SECTION_TYPES.RECENT_ACTIVITY, status: true, list_order: 11 },
  { display_type: SECTION_TYPES.MILESTONES, status: true, list_order: 12 },
  { display_type: SECTION_TYPES.AVAILABILITY_SCHEDULE, status: true, list_order: 13 },
  { display_type: SECTION_TYPES.TIPS_AND_GROWTH, status: true, list_order: 14 },
];
