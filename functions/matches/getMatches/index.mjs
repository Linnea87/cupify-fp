// ==================================================
// Endpoint: GET /tournaments/{id}/matches
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { getMatchesByTournament } from "../../../services/matches.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const getMatchesHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;

  // Check if the tournament exists
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // Get all matches for the tournament
  const matches = await getMatchesByTournament(tournamentId);

  return sendResponse(200, matches);
};

export const handler = middy(getMatchesHandler)
  .use(errorHandler());
