// ==================================================
// Endpoint: PATCH /tournaments/{id}/status
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import {
  getTournamentById,
  updateTournamentStatus,
} from "../../../services/tournaments.mjs";

// Status values allowed by the API specification
const ALLOWED_STATUSES = ["upcoming", "ongoing", "completed"];

const updateTournamentStatusHandler = async (event) => {
  const { id } = event.pathParameters;
  const { status } = event.body ?? {};

  // Validate the new status
  if (!ALLOWED_STATUSES.includes(status)) {
    throw createError(400, "Status must be upcoming, ongoing or completed");
  }

  // Check if the tournament exists
  const tournament = await getTournamentById(id);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  const updatedTournament = await updateTournamentStatus(id, status);

  return sendResponse(200, updatedTournament);
};

export const handler = middy(updateTournamentStatusHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());
