// ==================================================
// Endpoint: DELETE /tournaments/{id}/teams/{teamId}
// ==================================================

import middy from "@middy/core";
import createError from "http-errors";
import { getTeamById, deleteTeam } from "../../../services/teams.mjs";
import { teamHasMatches } from "../../../services/matches.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const deleteTeamHandler = async (event) => {
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

  const hasMatches = await teamHasMatches(tournamentId, teamId);
  if (hasMatches) {
    throw createError(409, "Team is used in a match and cannot be deleted");
  }

  await deleteTeam(tournamentId, teamId);

  return sendResponse(204);

};

export const handler = middy(deleteTeamHandler)
  .use(errorHandler());