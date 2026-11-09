// ==================================================
// Endpoint: POST /tournaments/{id}/teams
// ==================================================

import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createTeam } from "../../../services/teams.mjs";
import createError from "http-errors";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "../../../services/db.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { randomUUID } from "crypto";

const createTeamHandler = async (event) => {
  const tournamentId = event.pathParameters.id;
  const { name, city, coach } = event.body ?? {};

  if (!name?.trim() || !city?.trim() || !coach?.trim()) {
    throw createError(400, "Namn, stad och tränare måste anges");
  }

  const tournament = await db.send(
    new GetCommand({
      TableName: process.env.TOURNAMENTS_TABLE,
      Key: {id: tournamentId},
    })
  );
  if (!tournament.Item) {
    throw createError(404, "Turneringen finns inte");
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



