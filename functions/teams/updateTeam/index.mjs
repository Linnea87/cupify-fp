// ==================================================
// Endpoint: PUT /tournaments/{id}/teams/{teamId}
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { updateTeam, getTeamById } from "../../../services/teams.mjs";
import { isNonEmptyString } from "../../../utils/validators.mjs";

const updateTeamHandler = async (event) => {
  const tournamentId = event.pathParameters.id;
  const teamId = event.pathParameters.teamId;
  const {name, city, coach} = event.body ?? {};

  if (!isNonEmptyString(name) || !isNonEmptyString(city) || !isNonEmptyString(coach)) {
    throw createError(400, "Name, city and coach are required");
  }

  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  const existingTeam = await getTeamById(tournamentId, teamId);

  if (!existingTeam) {
    throw createError(404, "Team not found");
  }

  const updatedTeam = await updateTeam(tournamentId, teamId, {
    name: name.trim(),
    city: city.trim(),
    coach: coach.trim(),
  });
  return sendResponse(200, updatedTeam);
};

export const handler = middy(updateTeamHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());