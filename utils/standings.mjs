// ==================================================
// Standings calculation
// ==================================================

// Points awarded per result, as defined in the API specification
const POINTS = { win: 3, draw: 1, loss: 0 };

// Create an empty standings row for a team
const createRow = (team) => ({
  teamId: team.id,
  teamName: team.name,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
});

// Add the result of one match to a team's row
const addResult = (row, scored, conceded) => {
  row.played += 1;
  row.goalsFor += scored;
  row.goalsAgainst += conceded;

  if (scored > conceded) {
    row.wins += 1;
    row.points += POINTS.win;
  } else if (scored === conceded) {
    row.draws += 1;
    row.points += POINTS.draw;
  } else {
    row.losses += 1;
    row.points += POINTS.loss;
  }
};

// Calculate standings from a tournament's teams and matches
export const calculateStandings = (teams, matches) => {
  // One row per team, so teams without matches are included
  const rows = new Map(teams.map((team) => [team.id, createRow(team)]));

  // Only completed matches count
  const completedMatches = matches.filter(
    (match) => match.status === "completed",
  );

  for (const match of completedMatches) {
    const homeRow = rows.get(match.homeTeamId);
    const awayRow = rows.get(match.awayTeamId);

    if (homeRow) addResult(homeRow, match.homeScore, match.awayScore);
    if (awayRow) addResult(awayRow, match.awayScore, match.homeScore);
  }

  // Sort by points, then by goal difference
  return [...rows.values()]
    .map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
};
