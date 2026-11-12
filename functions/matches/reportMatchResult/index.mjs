// ==================================================
// Endpoint: PATCH /tournaments/{id}/matches/{matchId}/result
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";

import { getMatchById, reportMatchResult } from "../../../services/matches.mjs";

import { getTournamentById } from "../../../services/tournaments.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const reportMatchResultHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;
  const matchId = event.pathParameters?.matchId;
  const body = event.body;

  // Validate the request body and scores
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError(400, "Valid request body is required");
  }

  const { homeScore, awayScore } = body;

  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    throw createError(400, "Valid homeScore and awayScore are required");
  }

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

  if (
    match.status !== "scheduled" ||
    match.homeScore != null ||
    match.awayScore != null
  ) {
    throw createError(
      409,
      "Match result already registered or match is not scheduled",
    );
  }

  // Save the result
  const updatedMatch = await reportMatchResult(
    tournamentId,
    matchId,
    homeScore,
    awayScore,
  );

  return sendResponse(200, updatedMatch);
};

export const handler = middy(reportMatchResultHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());
