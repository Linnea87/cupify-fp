// ==================================================
// HTTP response helpers
// ==================================================

const headers = { "Content-Type": "application/json" };

// --------------------------------------------------
// Success response with JSON body
// --------------------------------------------------
export const success = (statusCode, data) => ({
  statusCode,
  headers,
  body: JSON.stringify(data),
});

// --------------------------------------------------
// Empty response for 204 No Content
// --------------------------------------------------
export const noContent = () => ({
  statusCode: 204,
});

// --------------------------------------------------
// Error response in a consistent format
// --------------------------------------------------
export const error = (statusCode, message) => ({
  statusCode,
  headers,
  body: JSON.stringify({ error: message }),
});
