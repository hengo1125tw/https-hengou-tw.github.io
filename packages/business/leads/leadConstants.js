export const LEAD_PRIORITY = Object.freeze({
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  UNKNOWN: "Unknown"
});

export const LEAD_STATUS = Object.freeze({
  NEW: "New",
  QUALIFIED: "Qualified",
  NEEDS_INFO: "Needs Info",
  LOW_FIT: "Low Fit",
  SPAM: "Spam",
  ARCHIVED: "Archived"
});

export const LEAD_SOURCE = Object.freeze({
  WEBSITE: "Website",
  MANUAL: "Manual",
  GMAIL: "Gmail",
  LINE: "LINE",
  TELEGRAM: "Telegram",
  THREADS: "Threads",
  REFERRAL: "Referral",
  OTHER: "Other"
});

export const MISSING_INFO_TYPE = Object.freeze({
  COMPANY_NAME: "company_name",
  CONTACT_NAME: "contact_name",
  EMAIL: "email",
  PHONE: "phone",
  REQUIREMENT: "requirement",
  BUDGET: "budget",
  TIMELINE: "timeline",
  QUANTITY: "quantity",
  SPECIFICATION: "specification",
  TARGET_COUNTRY: "target_country",
  FILE_OR_IMAGE: "file_or_image"
});
