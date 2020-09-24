const {
  getMatch,
  getBattingTeam,
  getBowlingTeam,
  getPlayer,
  getScoreCard,
} = require('./utilities');

const getTeamInfo = (team) => {
  let newTeam = {};
  newTeam.name = team.name;
  newTeam.score = 0;
  newTeam.balls = 0;
  newTeam.wickets = 0;
  newTeam.players = team.players.map((player) => ({
    name: player,
    batting: { score: 0, balls: 0 },
    bowling: { score: 0, balls: 0, wickets: 0 },
    isBatted: false,
  }));
  return newTeam;
};

const setMatch = ({
  visitorTeam,
  hostingTeam,
  matchDetails,
  battingTeam,
  matchId,
}) => ({
  matchId: matchId,
  target: 0,
  winner: null,
  visitorTeam: getTeamInfo(visitorTeam),
  hostingTeam: getTeamInfo(hostingTeam),
  overs: matchDetails.overs,
  tossWon: matchDetails.toss,
  opted: matchDetails.opted,
  currentStatus: { battingTeam, inning: '1st' },
  inPlay: {
    batsman: null,
    opponentBatsman: null,
    bowler: null,
    currentOver: [],
  },
});

const getNotBattedPlayers = (players, player) => {
  if (!player.isBatted) players.push(player.name);
  return players;
};

const getPlayersToChoose = (matches, matchId) => {
  const match = getMatch(matches, matchId);
  const battingTeam = getBattingTeam(match);
  const bowlingTeam = getBowlingTeam(match);
  let playersToChoose = {};
  if (!match.inPlay.batsman) {
    const players = battingTeam.players.reduce(getNotBattedPlayers, []);
    playersToChoose.strike = players;
  }
  if (!match.inPlay.opponentBatsman) {
    const players = battingTeam.players.reduce(getNotBattedPlayers, []);
    playersToChoose.nonStrike = players;
  }
  if (!match.inPlay.bowler) {
    const players = bowlingTeam.players.map((player) => player.name);
    playersToChoose.bowler = players;
  }
  return playersToChoose;
};

const setPlayerBatted = (match, batsmanName) => {
  const battingTeam = getBattingTeam(match);
  const batsman = getPlayer(battingTeam, batsmanName);
  batsman.isBatted = true;
};

const updateInPlay = (matches, matchId, playersToUpdate) => {
  let match = getMatch(matches, matchId);
  const { strick, nonStrick, bowler } = playersToUpdate;

  if (strick) {
    setPlayerBatted(match, strick);
    match.inPlay.batsman = strick;
  }
  if (nonStrick) {
    match.inPlay.opponentBatsman = nonStrick;
    setPlayerBatted(match, nonStrick);
  }
  if (bowler) match.inPlay.bowler = bowler;
  return getScoreCard(matches, matchId);
};

const matchTeamDetails = (team) => {
  const { name, score, wickets, balls } = team;
  return { name, score, wickets, balls };
};

const getMatchDetails = (match) => {
  const { winner, tossWon, opted, matchId } = match;
  const matchInfo = { winner, tossWon, opted, id: matchId };
  matchInfo.visitorTeam = matchTeamDetails(match.visitorTeam);
  matchInfo.hostingTeam = matchTeamDetails(match.hostingTeam);
  return matchInfo;
};

const geMatchesData = (matches) => {
  return matches.map(getMatchDetails);
};

const mapPlayer = (player) => ({
  name: player.name,
  score: player.batting.score,
  balls: player.batting.balls,
});

const filterTeam = (battingTeam, bowlingTeam) => {
  const { name, score, balls, wickets, players } = battingTeam;
  const bowlingPlayers = bowlingTeam.players;
  const battedPlayers = players.filter((player) => player.isBatted === true);
  const notBattedPlayers = players.filter(
    (player) => player.isBatted === false
  );
  const bowledPlayers = bowlingPlayers.filter(
    (player) => player.bowling.balls > 1
  );

  const bowled = bowledPlayers.map((player) => ({
    name: player.name,
    score: player.bowling.score,
    balls: player.bowling.balls,
    wickets: player.bowling.wickets,
  }));
  const batted = battedPlayers.map(mapPlayer);
  const notBatted = notBattedPlayers.map(mapPlayer);
  return { batted, bowled, notBatted, name, score, balls, wickets };
};

const getMatchScoreBoard = (matches, matchId) => {
  let match = getMatch(matches, matchId);
  const battingTeamPlayers = getBattingTeam(match);
  const bowlingTeamPlayers = getBowlingTeam(match);
  const { winner, tossWon, opted, overs, target } = match;
  const battingTeam = filterTeam(battingTeamPlayers, bowlingTeamPlayers);
  const bowlingTeam = filterTeam(bowlingTeamPlayers, battingTeamPlayers);
  return {
    battingTeam,
    bowlingTeam,
    inning: match.currentStatus.inning,
    winner,
    tossWon,
    opted,
    target,
    overs,
    balls: battingTeam.balls,
    score: battingTeam.score,
  };
};

module.exports = {
  geMatchesData,
  setMatch,
  getPlayersToChoose,
  updateInPlay,
  getMatchScoreBoard,
};
