import { PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
};

export const getTeamsByTournament = async (tournamentId) => {
    const result = await db.send(
        new QueryCommand({
            TableName: process.env.TEAMS_TABLE,
            KeyConditionExpression: "tournamentId = :tournamentId",
            ExpressionAttributeValues: { ":tournamentId": tournamentId,},
        })

    );
    return result.Items;
};

export const updateTeam = async (tournamentId, teamId, data) => {
    const result = await db.send(
        new UpdateCommand({
            TableName: process.env.TEAMS_TABLE,
            Key: {tournamentId, id: teamId},
            UpdateExpression: "SET #name = :name, city = :city, coach = :coach",
            ExpressionAttributeNames: {"#name": "name"},
            ExpressionAttributeValues: {":name": data.name, ":city": data.city, ":coach": data.coach,},
            ConditionExpression: "attribute_exists(id)", 
            ReturnValues: "ALL_NEW",
        })
    );
    return result.Attributes;
};

export const tournamentHasTeams = async (tournamentId) => {
  const result = await db.send(
    new QueryCommand({
      TableName: process.env.TEAMS_TABLE,
      KeyConditionExpression: "tournamentId = :tournamentId",
      ExpressionAttributeValues: {
        ":tournamentId": tournamentId,
      },
      Limit: 1,
    })
  );

  return result.Items.length > 0;
};

export const deleteTeam = async (tournamentId, teamId) => {
  await db.send(
    new DeleteCommand({
      TableName: process.env.TEAMS_TABLE,
      Key: { tournamentId, id: teamId },
    })
  );
};