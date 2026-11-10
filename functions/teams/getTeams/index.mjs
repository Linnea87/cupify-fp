// ==================================================
// Endpoint: GET /tournaments/{id}/teams
// ==================================================
import middy from "@middy/core";
import createError from "http-errors";
import { getTeamsByTournament } from "../../../services/teams.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";

const getTeamsHandler = async (event) => {
  const tournamentId = event.pathParameters.id;

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }
  const teams = await getTeamsByTournament(tournamentId);

  return sendResponse(200, teams);
}

export const handler = middy(getTeamsHandler).use(errorHandler());
