const express = require('express');
const morgan = require('morgan');
const redis = require('redis');
const { DB } = require('./db');
const session = require('cookie-session');
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REACT_HOME_PAGE_URL,
  SECRET_MSG,
} = require('../config');
const {
  setupMatch,
  loadData,
  getInPlay,
  choosePlayers,
  updateInPP,
  updateScoreCard,
  getMatches,
  getScoreBoard,
  checkAuthentication,
  getUserDetails,
  authenticate,
  getUser,
  setUserLogout,
  checkOwner,
} = require('./handlers');

const url = process.env.REDIS_URL || '6379';
const redisClient = redis.createClient(url);
const db = new DB(redisClient);

const app = express();

app.locals.CLIENT_ID = CLIENT_ID;
app.locals.CLIENT_SECRET = CLIENT_SECRET;
app.locals.REACT_HOME_PAGE_URL = REACT_HOME_PAGE_URL;
app.locals.db = db;

app.set('sessionMiddleware', session({ secret: SECRET_MSG }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/todo', express.static('build'));
app.use((...args) => app.get('sessionMiddleware')(...args));
app.use(loadData);
app.use(express.static('public'));

app.get('/api/scoreBoard/:id', getScoreBoard);
app.get('/api/getMatches', getMatches);

app.get('/api/getUser', getUser);
app.get('/api/authenticate', authenticate);
app.get('/callback', getUserDetails);
app.use(checkAuthentication);

app.post('/api/logout', setUserLogout);
app.post('/api/setupMatch', setupMatch);
app.param('matchId', checkOwner);
app.get('/api/getInPlay/:matchId', getInPlay);
app.get('/api/choosePlayers/:matchId', choosePlayers);
app.post('/api/updateInPP/:matchId', updateInPP);
app.post('/api/updateScore/:matchId', updateScoreCard);

module.exports = { app };
