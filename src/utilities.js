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

const getScoreCard = (matches, matchId) => {
  const match = getMatch(matches, matchId);
  const battingTeam = getBattingTeam(match);
  const bowlingTeam = getBowlingTeam(match);

  const {
    inPlay,
    target,
    tossWon,
    hostingTeam,
    visitorTeam,
    opted,
    overs,
    winner,
  } = match;
  const teams = {
    hostingTeam: hostingTeam.name,
    visitorTeam: visitorTeam.name,
  };
  const { name, score, wickets, balls } = battingTeam;
  const { inning } = match.currentStatus;
  const batsman = getPlayer(battingTeam, inPlay.batsman);
  const opponentBatsman = getPlayer(battingTeam, inPlay.opponentBatsman);
  const bowler = getPlayer(bowlingTeam, inPlay.bowler);
  const { currentOver } = inPlay;

  return {
    teams,
    scoreBoard: {
      team: name,
      inning,
      score,
      wickets,
      balls,
      target,
      opted,
      tossWon,
      overs,
    },
    inPlay: { batsman, opponentBatsman, bowler },
    currentOver,
    winner,
  };
};

module.exports = {
  getBattingTeamName,
  getMatch,
  getBattingTeam,
  getBowlingTeam,
  getPlayer,
  getScoreCard,
};
