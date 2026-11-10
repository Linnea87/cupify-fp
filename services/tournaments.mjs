// ==================================================
// Tournaments service – DynamoDB operations
// ==================================================

import { GetCommand } from "@aws-sdk/lib-dynamodb";
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
