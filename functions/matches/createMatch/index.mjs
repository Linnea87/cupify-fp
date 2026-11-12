// ==================================================
// Endpoint: POST /tournaments/{id}/matches
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";
import { randomUUID } from "crypto";

import { createMatch } from "../../../services/matches.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { getTeamById } from "../../../services/teams.mjs";
import {
  isNonEmptyString,
  isValidIsoDate,
} from "../../../utils/validators.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const createMatchHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;
  const { homeTeamId, awayTeamId, date } = event.body ?? {};

  // Validate required fields
  if (!isNonEmptyString(homeTeamId) || !isNonEmptyString(awayTeamId)) {
    throw createError(400, "homeTeamId and awayTeamId are required");
  }

  if (!isValidIsoDate(date)) {
    throw createError(400, "Invalid ISO 8601 date");
  }

  const homeId = homeTeamId.trim();
  const awayId = awayTeamId.trim();

  // A team cannot play itself
  if (homeId === awayId) {
    throw createError(400, "A team cannot play itself");
  }

  // Check if the tournament exists
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // Check that both teams belong to the tournament
  const [homeTeam, awayTeam] = await Promise.all([
    getTeamById(tournamentId, homeId),
    getTeamById(tournamentId, awayId),
  ]);

  if (!homeTeam || !awayTeam) {
    throw createError(404, "Team not found");
  }

  // Create the scheduled match
  const match = {
    id: randomUUID(),
    tournamentId,
    homeTeamId: homeId,
    awayTeamId: awayId,
    date,
    status: "scheduled",
    homeScore: null,
    awayScore: null,
  };

  await createMatch(match);

  return sendResponse(201, match);
};

export const handler = middy(createMatchHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());
