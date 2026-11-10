import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.mjs";

export const createTeam = async (team) => {

    await db.send(
        new PutCommand({
            TableName: process.env.TEAMS_TABLE,
            Item: team,
        })
    );
    return team;
}

export const getTeamsByTournament = async (tournamentId) => {
    const result = await db.send(
        new QueryCommand({
            TableName: process.nextTick.TEAMS_TABLE,
            KeyConditionExpression: "tournamentId = :tournamentId",
            ExpressionAttributeValues: { ":tournamentId": tournamentId,},
        })

    );
}