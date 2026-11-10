// ==================================================
// Endpoint: POST /tournaments/{id}/teams
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createTeam } from "../../../services/teams.mjs";
import createError from "http-errors";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { randomUUID } from "crypto";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { isNonEmptyString } from "../../../utils/validators.mjs";

const createTeamHandler = async (event) => {
  const tournamentId = event.pathParameters.id;
  const { name, city, coach } = event.body ?? {};

  if (!isNonEmptyString(name) || !isNonEmptyString(city)|| !isNonEmptyString(coach)) {
    throw createError(400, "Name, city and coach are required");
  } 

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  const team = {
    id: randomUUID(),
    tournamentId,
    name: name.trim(),
    city: city.trim(),
    coach: coach.trim(),
  };

  await createTeam(team);

  return sendResponse(201, team);
};

export const handler = middy(createTeamHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());



