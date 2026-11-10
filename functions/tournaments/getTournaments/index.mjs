// ==================================================
// Endpoint: GET /tournaments
// ==================================================

import middy from "@middy/core";
import { sendResponse } from "../../../responses/index.mjs";
import { errorHandler } from "../../../middlewares/errorHandler.mjs";
import { getTournaments } from "../../../services/tournaments.mjs";

const getTournamentsHandler = async () => {
  const tournaments = await getTournaments();
  return sendResponse(200, tournaments);
};

export const handler = middy(getTournamentsHandler).use(errorHandler());
