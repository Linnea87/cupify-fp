import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./db.mjs";

export const createTeam = async (team) => {

    await db.send(
        new PutCommand({
            TableName: process.env.TEAMS_TABLE,
            Item: team,
        })
    );
    return team;
};

export const getTeamById = async (tournamentId, teamId) => {
    const result = await db.send(
        new GetCommand({
            TableName: process.env.TEAMS_TABLE,
            Key: { tournamentId, id: teamId},
        })
    );
    return result.Item;
}