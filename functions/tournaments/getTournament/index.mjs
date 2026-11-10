// ==================================================
// Endpoint: GET /tournaments/{id}
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";

const getTournament = async (event) => {
  const { id } = event.pathParameters;

  const tournament = await getTournamentById(id);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  return sendResponse(200, tournament);
};

export const handler = middy(getTournament).use(errorHandler());
