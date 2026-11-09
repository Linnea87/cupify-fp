
import middy from "@middy/core";
import { getMatchesByTournament } from "../../../services/matches.mjs";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";

const getMatchesHandler = async (event) => {
  const tournamentId = event.pathParameters?.id;

  const matches = await getMatchesByTournament(tournamentId);

  return sendResponse(200, matches);
};

export const handler = middy(getMatchesHandler)
  .use(errorHandler());
