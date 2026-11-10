// ==================================================
// Endpoint: GET /tournaments/{id}/teams/{teamId}
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { getTeamById } from "../../../services/teams.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";

const getTeamHandler = async (event) => {
  const tournamentId = event.pathParameters.id;
  const teamId = event.pathParameters.teamId;

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }


  const team = await getTeamById(tournamentId, teamId);
  if (!team) {
    throw createError(404, "Team not found");
  }
  return sendResponse(200, team);
}

export const handler = middy(getTeamHandler).use(errorHandler());
