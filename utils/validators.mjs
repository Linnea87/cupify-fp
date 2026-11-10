// ==================================================
// Shared input validators
// ==================================================

// Matches YYYY-MM-DD with an optional time part, e.g. 2026-11-20 or 2026-11-20T14:00:00Z
const ISO_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

// True if the value is a string with at least one non-space character
export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim() !== "";

// True if the value is a real date in ISO 8601 format
export const isValidIsoDate = (value) => {
  if (typeof value !== "string") return false;

  const match = value.match(ISO_DATE_PATTERN);
  if (!match || Number.isNaN(Date.parse(value))) return false;

  // Reject dates that do not exist, e.g. 2026-02-30
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
