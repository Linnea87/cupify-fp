// ==================================================
// Endpoint: DELETE /tournaments/{id}
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import {
  deleteTournament,
  getTournamentById,
} from "../../../services/tournaments.mjs";
import { tournamentHasTeams } from "../../../services/teams.mjs";
import { tournamentHasMatches } from "../../../services/matches.mjs";

const deleteTournamentHandler = async (event) => {
  const { id } = event.pathParameters;

  // Check if the tournament exists
  const tournament = await getTournamentById(id);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // A tournament with teams or matches cannot be deleted
  const [hasTeams, hasMatches] = await Promise.all([
    tournamentHasTeams(id),
    tournamentHasMatches(id),
  ]);

  if (hasTeams || hasMatches) {
    throw createError(
      409,
      "Tournament with teams or matches cannot be deleted",
    );
  }

  await deleteTournament(id);

  return sendResponse(204);
};

export const handler = middy(deleteTournamentHandler).use(errorHandler());
