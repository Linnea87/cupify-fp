
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";

// Get all matches belonging to a tournament
export const getMatchesByTournament = async (tournamentId) => {
  // Check if the tournament exists
  const tournamentResult = await db.send(
    new GetCommand({
      TableName: process.env.TOURNAMENTS_TABLE,
      Key: { id: tournamentId },
    })
  );

  if (!tournamentResult.Item) {
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
