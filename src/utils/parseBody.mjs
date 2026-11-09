// ==================================================
// Request body parsing
// ==================================================

// --------------------------------------------------
// Returns the parsed body as an object,
// or null if the body is missing or not valid JSON
// --------------------------------------------------
export const parseBody = (event) => {
  if (!event.body) {
    return null;
  }

  try {
    const body = JSON.parse(event.body);
    const isObject =
      typeof body === "object" && body !== null && !Array.isArray(body);
    return isObject ? body : null;
  } catch {
    return null;
  }
};
