// ==================================================
// Endpoint: DELETE /tournaments/{id}/matches/{matchId}
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";

import { getMatchById, deleteMatch } from "../../../services/matches.mjs";

import { getTournamentById } from "../../../services/tournaments.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const deleteMatchHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;
  const matchId = event.pathParameters?.matchId;

  // Check whether the tournament exists
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // Check whether the match exists
  const match = await getMatchById(tournamentId, matchId);

  if (!match) {
    throw createError(404, "Match not found");
  }

  // Delete the match
  await deleteMatch(tournamentId, matchId);

  return sendResponse(204);
};

export const handler = middy(deleteMatchHandler).use(errorHandler());
