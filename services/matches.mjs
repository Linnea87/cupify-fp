// ==================================================
// Matches service – DynamoDB operations
// ==================================================

import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";

// Get all matches belonging to a tournament
export const getMatchesByTournament = async (tournamentId) => {
  try {
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
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not get matches");
  }
};
