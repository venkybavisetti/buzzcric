const axios = require('axios');
const app = require('./app');
const match = require('./match');
const {
  setMatch,
  getPlayersToChoose,
  updateInPlay,
  geMatchesData,
  getMatchScoreBoard,
  isOwner,
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

  const match = setMatch(
    {
      ...matchInfo,
      battingTeam,
      matchId: matches.length,
    },
    req.session
  );

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
  const { id } = req.params;
  const { matches } = req.app.locals;
  const matchData = getMatchScoreBoard(matches, +id);
  res.json(matchData);
};

const checkAuthentication = (req, res, next) => {
  if (req.session.isNew) {
    res.status(403);
    res.json({ message: 'unauthorize resource' });
    return;
  }
  next();
};

const getUserDetails = (req, res) => {
  const code = req.query.code;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };
  axios
    .post(
      `https://github.com/login/oauth/access_token?client_id=${req.app.locals.CLIENT_ID}&client_secret=${req.app.locals.CLIENT_SECRET}&code=${code}`,
      { headers }
    )
    .then((response) => {
      let [access_token] = response.data.split('&');
      access_token = access_token.split('=')[1];
      const headers = { Authorization: `token ${access_token}` };
      axios.get(`https://api.github.com/user`, { headers }).then((resp2) => {
        const { id, login, avatar_url } = resp2.data;
        req.session.id = id;
        req.session.username = login;
        req.session.avatar_url = avatar_url;

        req.app.locals.db.addUser({
          id,
          name: login,
          img: avatar_url,
        });
        res.redirect(req.app.locals.REACT_HOME_PAGE_URL);
      });
    });
};

const authenticate = (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${req.app.locals.CLIENT_ID}`
  );
};

const getUser = (req, res) => {
  req.app.locals.db.getUser(req.session.id).then((data) => res.json(data));
};

const setUserLogout = (req, res) => {
  req.session = null;
  res.json({ status: true });
};

const checkOwner = (req, res, next, matchId) => {
  const { matches } = req.app.locals;
  const owner = isOwner(matches, +matchId, req.session.id);

  if (!owner) {
    res.status(403);
    return res.json({ message: 'unauthorize resource' });
  }

  next();
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
  checkAuthentication,
  getUserDetails,
  authenticate,
  getUser,
  setUserLogout,
  checkOwner,
};
