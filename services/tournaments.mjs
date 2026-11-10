// ==================================================
// Tournaments service – DynamoDB operations
// ==================================================

import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";

const TABLE_NAME = process.env.TOURNAMENTS_TABLE;

// Partition key value shared by all tournaments
const TOURNAMENT_TYPE = "tournament";

// Remove the internal type attribute so responses match the API specification
const toTournament = ({ type, ...tournament }) => tournament;

// Get a tournament by id – returns null if not found
export const getTournamentById = async (id) => {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { type: TOURNAMENT_TYPE, id },
    });
    const { Item } = await db.send(command);
    return Item ? toTournament(Item) : null;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not get tournament");
  }
};

// Save a new tournament
export const createTournament = async (tournament) => {
  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...tournament, type: TOURNAMENT_TYPE },
      ConditionExpression: "attribute_not_exists(id)",
    });

    await db.send(command);
    return tournament;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not create tournament");
  }
};

// Get all tournaments with a query on the shared partition key
export const getTournaments = async () => {
  try {
    const tournaments = [];
    let lastKey;

    do {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "#type = :type",
        ExpressionAttributeNames: { "#type": "type" },
        ExpressionAttributeValues: { ":type": TOURNAMENT_TYPE },
        ExclusiveStartKey: lastKey,
      });

      const { Items, LastEvaluatedKey } = await db.send(command);
      tournaments.push(...(Items ?? []).map(toTournament));
      lastKey = LastEvaluatedKey;
    } while (lastKey);

    return tournaments;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not get tournaments");
  }
};

// Update only the status of a tournament and return the updated tournament
export const updateTournamentStatus = async (id, status) => {
  try {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { type: TOURNAMENT_TYPE, id },
      UpdateExpression: "SET #status = :status",
      ConditionExpression: "attribute_exists(id)",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
      ReturnValues: "ALL_NEW",
    });

    const { Attributes } = await db.send(command);
    return toTournament(Attributes);
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not update tournament status");
  }
};
