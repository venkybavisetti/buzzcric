const match = require('./match');
const {
  setMatch,
  getPlayersToChoose,
  updateInPlay,
  geMatchesData,
  getMatchScoreBoard,
} = require('./match');
const { updateScore } = require('./updateScore');
const { getBattingTeamName, getScoreCard } = require('./utilities');

const loadData = (req, res, next) => {
  req.app.locals.db.loadData().then((matches) => {
    req.app.locals.matches = matches || [];
    next();
  });
};

const setupMatch = (req, res) => {
  const matchInfo = req.body;
  const { matches, db } = req.app.locals;
  const battingTeam = getBattingTeamName(
    matchInfo.hostingTeam.name,
    matchInfo.visitorTeam.name,
    matchInfo.matchDetails
  );

  const match = setMatch({
    ...matchInfo,
    battingTeam,
    matchId: matches.length,
  });

  matches.unshift(match);
  db.saveData(matches).then(
    (status) => status && res.end(JSON.stringify(match.matchId))
  );
};

const getInPlay = function (req, res) {
  const { matchId } = req.params;
  const { matches, db } = req.app.locals;
  const inPlayInfo = getScoreCard(matches, +matchId);
  res.json(inPlayInfo);
};

const choosePlayers = (req, res) => {
  const { matchId } = req.params;
  const { matches, db } = req.app.locals;
  const players = getPlayersToChoose(matches, +matchId);
  res.json(players);
};

const updateInPP = (req, res) => {
  const { matchId } = req.params;
  const { matches, db } = req.app.locals;
  const playersToUpdate = req.body;
  const updatedInPlayInfo = updateInPlay(matches, +matchId, playersToUpdate);
  db.saveData(matches).then((status) => status && res.json(updatedInPlayInfo));
};

const updateScoreCard = (req, res) => {
  const { matchId } = req.params;
  const { matches, db } = req.app.locals;
  const { ball } = req.body;

  const newScoreBoard = updateScore(matches, +matchId, ball);
  db.saveData(matches).then((status) => status && res.json(newScoreBoard));
};

const getMatches = (req, res) => {
  const { matches, db } = req.app.locals;
  const matchesData = geMatchesData(matches);
  res.json(matchesData);
};

const getScoreBoard = (req, res) => {
  const { matchId } = req.params;
  const { matches } = req.app.locals;
  const matchData = getMatchScoreBoard(matches, +matchId);
  res.json(matchData);
};

module.exports = {
  getScoreBoard,
  setupMatch,
  loadData,
  getInPlay,
  choosePlayers,
  updateInPP,
  updateScoreCard,
  getMatches,
};
