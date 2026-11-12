// ==================================================
// Endpoint: GET /tournaments/{id}/matches/{matchId}
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { getMatchById } from "../../../services/matches.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const getMatchHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;
  const matchId = event.pathParameters?.matchId;

  // Check if the tournament exists
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // Get the requested match
  const match = await getMatchById(tournamentId, matchId);

  if (!match) {
    throw createError(404, "Match not found");
  }

  return sendResponse(200, match);
};

export const handler = middy(getMatchHandler).use(errorHandler());
