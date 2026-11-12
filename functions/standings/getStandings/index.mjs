// ==================================================
// Endpoint: GET /tournaments/{id}/standings
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { getTeamsByTournament } from "../../../services/teams.mjs";
import { getMatchesByTournament } from "../../../services/matches.mjs";
import { calculateStandings } from "../../../utils/standings.mjs";

const getStandingsHandler = async (event) => {
  const { id } = event.pathParameters;

  // Check if the tournament exists
  const tournament = await getTournamentById(id);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // Fetch teams and matches at the same time
  const [teams, matches] = await Promise.all([
    getTeamsByTournament(id),
    getMatchesByTournament(id),
  ]);

  const standings = calculateStandings(teams, matches);

  return sendResponse(200, standings);
};

export const handler = middy(getStandingsHandler).use(errorHandler());
