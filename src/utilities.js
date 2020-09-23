const getBattingTeamName = (hostingTeam, visitorTeam, matchDetails) => {
  let battingTeam = '';
  if (matchDetails.opted === 'bat') {
    battingTeam = matchDetails.toss;
  } else {
    battingTeam = matchDetails.toss === hostingTeam ? visitorTeam : hostingTeam;
  }
  return battingTeam;
};

const getBattingTeam = (match) => {
  const teams = {
    [match.visitorTeam.name]: match.visitorTeam,
    [match.hostingTeam.name]: match.hostingTeam,
  };
  return teams[match.currentStatus.battingTeam];
};

const getBowlingTeam = (match) => {
  const teams = {
    [match.hostingTeam.name]: match.visitorTeam,
    [match.visitorTeam.name]: match.hostingTeam,
  };
  return teams[match.currentStatus.battingTeam];
};

const getMatch = (matches, matchId) =>
  matches.find((match) => match.matchId === matchId);

const getPlayer = (team, name) =>
  team.players.find((player) => player.name === name);

const getInPlayInfo = (matches, matchId) => {
  const match = getMatch(matches, matchId);
  const battingTeam = getBattingTeam(match);
  const bowlingTeam = getBowlingTeam(match);

  const inPlayInfo = {};
  inPlayInfo.scoreBoard = {
    team: battingTeam.name,
    inning: match.currentStatus.inning,
    score: battingTeam.score,
    wickets: battingTeam.wickets,
    overs: battingTeam.balls,
  };
  inPlayInfo.batsman = getPlayer(battingTeam, match.inPlay.batsman);
  inPlayInfo.opponentBatsman = getPlayer(
    battingTeam,
    match.inPlay.opponentBatsman
  );
  inPlayInfo.bowler = getPlayer(bowlingTeam, match.inPlay.bowler);
  inPlayInfo.currentOver = match.inPlay.currentOver;
  return inPlayInfo;
};

module.exports = {
  getBattingTeamName,
  getMatch,
  getBattingTeam,
  getBowlingTeam,
  getPlayer,
  getInPlayInfo,
};
