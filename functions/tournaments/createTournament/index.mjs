// ==================================================
// Endpoint: POST /tournaments
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";
import { randomUUID } from "crypto";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { createTournament } from "../../../services/tournaments.mjs";
import {
  isNonEmptyString,
  isValidIsoDate,
} from "../../../utils/validators.mjs";

const createTournamentHandler = async (event) => {
  const { name, sport, location, startDate } = event.body ?? {};

  // Validate input
  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(sport) ||
    !isNonEmptyString(location)
  ) {
    throw createError(
      400,
      "Name, sport and location are required and cannot be empty",
    );
  }

  if (!isValidIsoDate(startDate)) {
    throw createError(400, "Start date must be a valid ISO 8601 date");
  }

  // Build and save the tournament
  const tournament = {
    id: randomUUID(),
    name: name.trim(),
    sport: sport.trim(),
    location: location.trim(),
    startDate,
    status: "upcoming",
  };

  await createTournament(tournament);

  return sendResponse(201, tournament);
};

export const handler = middy(createTournamentHandler)
  .use(httpJsonBodyParser())
  .use(errorHandler());
