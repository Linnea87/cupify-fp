// ==================================================
// Endpoint: POST /tournaments/{id}/teams
// ==================================================

// TODO: Implement according to the API specification
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createTeam } from "../../../services/teams.mjs";

const createTeamHandler = async (event) => {
  const tournamentId = event.pathParameters.id;
  const { name, city, coach } = event.body;

};

export const handler = middy(createTeamHandler).use(httpJsonBodyParser());



