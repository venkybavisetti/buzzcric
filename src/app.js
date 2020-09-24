const { setupMaster } = require('cluster');
const express = require('express');
const morgan = require('morgan');
const redis = require('redis');
const { DB } = require('./db');
const {
  setupMatch,
  loadData,
  getInPlay,
  choosePlayers,
  updateInPP,
  updateScoreCard,
  getMatches,
  getScoreBoard,
} = require('./handlers');

const url = process.env.REDIS_URL || '6379';

const redisClient = redis.createClient(url);
const db = new DB(redisClient);

const app = express();
app.locals.db = db;
app.use(morgan('dev'));
app.use(express.json());
app.use('/todo', express.static('build'));
app.use(express.static('build'));
app.use(loadData);

app.post('/api/setupMatch', setupMatch);
app.post('/api/updateInPP/:matchId', updateInPP);
app.post('/api/updateScore/:matchId', updateScoreCard);
app.get('/api/getInPlay/:matchId', getInPlay);
app.get('/api/choosePlayers/:matchId', choosePlayers);
app.get('/api/getMatches', getMatches);
app.get('/api/scoreBoard/:matchId', getScoreBoard);

module.exports = { app };
