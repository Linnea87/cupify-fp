// ==================================================
// Teams service – DynamoDB operations
// ==================================================

import {
    PutCommand,
    GetCommand,
    QueryCommand,
    DeleteCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { db } from "./db.mjs";

const TABLE_NAME = process.env.TEAMS_TABLE;

// Create a new team
export const createTeam = async (team) => {
    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: team,
        });

        await db.send(command);
        return team;
    } catch (error) {
        console.log("ERROR:", error);
        throw createError(500, "Could not create team");
    }
};

// Get a team by tournament ID and team ID
export const getTeamById = async (tournamentId, teamId) => {
    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { tournamentId, id: teamId },
        });

        const { Item } = await db.send(command);
        return Item ?? null;
    } catch (error) {
        console.log("ERROR:", error);
        throw createError(500, "Could not get team");
    }
};

// Get all teams belonging to a tournament
export const getTeamsByTournament = async (tournamentId) => {
    try {
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "tournamentId = :tournamentId",
            ExpressionAttributeValues: {
                ":tournamentId": tournamentId,
            },
        });

        const { Items } = await db.send(command);
        return Items ?? [];
    } catch (error) {
        console.log("ERROR:", error);
        throw createError(500, "Could not get teams");
    }
};

// Update a team
export const updateTeam = async (tournamentId, teamId, data) => {
    try {
        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { tournamentId, id: teamId },
            UpdateExpression: "SET #name = :name, city = :city, coach = :coach",
            ExpressionAttributeNames: {
                "#name": "name",
            },
            ExpressionAttributeValues: {
                ":name": data.name,
                ":city": data.city,
                ":coach": data.coach,
            },
            ConditionExpression: "attribute_exists(id)",
            ReturnValues: "ALL_NEW",
        });

        const { Attributes } = await db.send(command);
        return Attributes;
    } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
            throw createError(404, "Team not found");
        }

        console.log("ERROR:", error);
        throw createError(500, "Could not update team");
    }
};

// Check whether a tournament has any teams
export const tournamentHasTeams = async (tournamentId) => {
    try {
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "tournamentId = :tournamentId",
            ExpressionAttributeValues: {
                ":tournamentId": tournamentId,
            },
            Limit: 1,
        });

        const { Items } = await db.send(command);
        return (Items ?? []).length > 0;
    } catch (error) {
        console.log("ERROR:", error);
        throw createError(500, "Could not check tournament teams");
    }
};

// Delete a team by tournament ID and team ID
export const deleteTeam = async (tournamentId, teamId) => {
    try {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { tournamentId, id: teamId },
        });

        await db.send(command);
    } catch (error) {
        console.log("ERROR:", error);
        throw createError(500, "Could not delete team");
    }
};
