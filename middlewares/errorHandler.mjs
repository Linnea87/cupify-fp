// ==================================================
// Error handler middleware
// ==================================================

import { sendResponse } from "../responses/index.mjs";

// Status codes Middy's JSON body parser uses for invalid or missing JSON
const BODY_ERROR_CODES = [415, 422];

export const errorHandler = () => ({
  onError: async (request) => {
    const error = request.error;
    const statusCode = error.statusCode ?? 500;

    // Invalid JSON body – returned as 400 per the API specification
    if (BODY_ERROR_CODES.includes(statusCode)) {
      request.response = sendResponse(400, {
        error: "Request body must be valid JSON",
      });
      return;
    }

    // Expected errors thrown with createError (400, 404, 409)
    if (statusCode < 500) {
      request.response = sendResponse(statusCode, { error: error.message });
      return;
    }

    // Unexpected errors – logged, returned without details
    console.log("ERROR:", error);
    request.response = sendResponse(500, { error: "Internal server error" });
  },
});
