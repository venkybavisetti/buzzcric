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
  isMatchCompleted: false,
  target: 0,
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

module.exports = {
  setMatch,
  getPlayersToChoose,
  updateInPlay,
};
