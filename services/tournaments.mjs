// ==================================================
// Tournaments service – DynamoDB operations
// ==================================================

import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";

const TABLE_NAME = process.env.TOURNAMENTS_TABLE;

// Get a tournament by id – returns null if not found
export const getTournamentById = async (id) => {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const { Item } = await db.send(command);
    return Item ?? null;
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
      Item: tournament,
      ConditionExpression: "attribute_not_exists(id)",
    });

    await db.send(command);
    return tournament;
  } catch (error) {
    console.log("ERROR:", error);
    throw createError(500, "Could not create tournament");
  }
};
