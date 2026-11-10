
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";
import { getTournamentById } from "./tournaments.mjs";

// Get all matches belonging to a tournament
export const getMatchesByTournament = async (tournamentId) => {
  // Check if the tournament exists using the shared service
  const tournament = await getTournamentById(tournamentId);

  if (!tournament) {
    throw createError(404, "Tournament not found");
  }

  // Query matches using tournamentId
  const matches = [];
  let lastKey;

  do {
    const result = await db.send(
      new QueryCommand({
        TableName: process.env.MATCHES_TABLE,
        KeyConditionExpression: "tournamentId = :id",
        ExpressionAttributeValues: {
          ":id": tournamentId,
        },
        ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
      })
    );

    matches.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return matches;
};
