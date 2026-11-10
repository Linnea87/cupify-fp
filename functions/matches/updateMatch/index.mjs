
// ==================================================
// Endpoint: PUT /tournaments/{id}/matches/{matchId}
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";

import { getMatchById, updateMatch } from "../../../services/matches.mjs";
import { getTournamentById } from "../../../services/tournaments.mjs";
import { getTeamById } from "../../../services/teams.mjs";
import {
  isNonEmptyString,
  isValidIsoDate,
} from "../../../utils/validators.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const updateMatchHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;
  const matchId = event.pathParameters?.matchId;
  const body = event.body ?? {};

  // Allow only team IDs and date
  const allowedFields = ["homeTeamId", "awayTeamId", "date"];

  if (
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((field) => !allowedFields.includes(field))
  ) {
    throw createError(400, "Only teams and date can be updated");
  }

  const { homeTeamId, awayTeamId, date } = body;

  // Validate input
  if (
    !isNonEmptyString(homeTeamId) ||
    !isNonEmptyString(awayTeamId) ||
    !isValidIsoDate(date)
  ) {
    throw createError(400, "Valid homeTeamId, awayTeamId and date are required");
  }

  const homeId = homeTeamId.trim();
  const awayId = awayTeamId.trim();

  if (homeId === awayId) {
    throw createError(400, "A team cannot play itself");
  }

  // Check tournament and match
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  const match = await getMatchById(tournamentId, matchId);
  if (!match) {
    throw createError(404, "Match not found");
  }

  if (match.status !== "scheduled") {
    throw createError(409, "Only scheduled matches can be updated");
  }

  // Check both teams belong to the tournament
  const [homeTeam, awayTeam] = await Promise.all([
    getTeamById(tournamentId, homeId),
    getTeamById(tournamentId, awayId),
  ]);

  if (!homeTeam || !awayTeam) {
    throw createError(404, "Team not found");
  }

  // Update the match
  const updatedMatch = await updateMatch(tournamentId, matchId, {
    homeTeamId: homeId,
    awayTeamId: awayId,
    date,
  });

  return sendResponse(200, updatedMatch);
};

export const handler = middy(updateMatchHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());
