// ==================================================
// Matches service – DynamoDB operations
// ==================================================

import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";


// Get a single match by tournament ID and match ID
export const getMatchById = async (tournamentId, matchId) => {
  try {
    const command = new GetCommand({
      TableName: process.env.MATCHES_TABLE,
      Key: {
        tournamentId,
        id: matchId,
      },
    });

    const { Item } = await db.send(command);

    return Item ?? null;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not get match");
  }
};


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


// Create a new match in DynamoDB
export const createMatch = async (match) => {
  try {
    const command = new PutCommand({
      TableName: process.env.MATCHES_TABLE,
      Item: match,
      ConditionExpression: "attribute_not_exists(id)",
    });

    await db.send(command);

    return match;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not create match");
  }
};

// Update the teams and date of a scheduled match

export const updateMatch = async (tournamentId, matchId, data) => {
  try {
    const command = new UpdateCommand({
      TableName: process.env.MATCHES_TABLE,
      Key: {
        tournamentId,
        id: matchId,
      },
      UpdateExpression:
        "SET homeTeamId = :home, awayTeamId = :away, #date = :date",
      ConditionExpression:
        "attribute_exists(id) AND #status = :scheduled",
      ExpressionAttributeNames: {
        "#date": "date",
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":home": data.homeTeamId,
        ":away": data.awayTeamId,
        ":date": data.date,
        ":scheduled": "scheduled",
      },
      ReturnValues: "ALL_NEW",
    });

    const { Attributes } = await db.send(command);

    return Attributes;
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      // Check whether the match is missing or already completed
      const match = await getMatchById(tournamentId, matchId);

      if (!match) {
        throw createError(404, "Match not found");
      }

      throw createError(409, "Only scheduled matches can be updated");
    }

    console.log("ERROR:", error);
    throw createError(500, "Could not update match");
  }
};

export const teamHasMatches = async (tournamentId, teamId) => {
  const matches = await getMatchesByTournament(tournamentId);

  return matches.some(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
  );
}

export const tournamentHasMatches = async (tournamentId) => {
  try {
    const result = await db.send(
      new QueryCommand({
        TableName: process.env.MATCHES_TABLE,
        KeyConditionExpression: "tournamentId = :tournamentId",
        ExpressionAttributeValues: {
          ":tournamentId": tournamentId,
        },
        Limit: 1,
      })
    );
    return result.Items.length > 0;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not check tournament matches");
  }
}

// Delete a match from DynamoDB
export const deleteMatch = async (tournamentId, matchId) => {
  try {
    const command = new DeleteCommand({
      TableName: process.env.MATCHES_TABLE,
      Key: {
        tournamentId,
        id: matchId,
      },
      ConditionExpression: "attribute_exists(id)",
    });

    await db.send(command);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      throw createError(404, "Match not found");
    }

    console.log("ERROR:", error);
    throw createError(500, "Could not delete match");
  }
};
