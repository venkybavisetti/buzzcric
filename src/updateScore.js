const {
  getMatch,
  getBattingTeam,
  getBowlingTeam,
  getPlayer,
  getScoreCard,
} = require('./utilities');

const updateBatingTeam = (lookup, team, ball, batsmanName) => {
  let [runs, extras] = getBallInfo(ball);

  team.score += +runs + lookup[extras].runs;
  team.balls += lookup[extras].ballCount;
  if (extras === 'wk') team.wickets += 1;
  let batsman = getPlayer(team, batsmanName);
  batsman.batting.score += +runs;
  batsman.batting.balls += lookup[extras].ballCount;
};

const updateBowlingTeam = (lookup, team, ball, bowlerName) => {
  let [runs, extras] = getBallInfo(ball);

  let bowler = getPlayer(team, bowlerName);
  bowler.bowling.score += +runs + lookup[extras].runs;
  bowler.bowling.balls += lookup[extras].ballCount;
  if (extras === 'wk') bowler.bowling.wickets += 1;
};

const updateInPlayStatus = (match, ball) => {
  let { inPlay } = match;
  let bowlingTeam = getBowlingTeam(match);
  let bowler = getPlayer(bowlingTeam, inPlay.bowler);
  let [runs, extras] = getBallInfo(ball);

  inPlay.currentOver.push(ball);

  if (extras === 'wk') inPlay.batsman = null;
  if (bowler.bowling.balls % 6 === 0) {
    inPlay.currentOver = [];
    inPlay.bowler = null;
    let playerName = inPlay.batsman;
    inPlay.batsman = inPlay.opponentBatsman;
    inPlay.opponentBatsman = playerName;
  }
  if (+runs === 1 || +runs === 3 || ball === '1lb' || ball === '3lb') {
    let playerName = inPlay.batsman;
    inPlay.batsman = inPlay.opponentBatsman;
    inPlay.opponentBatsman = playerName;
  }
};

const getBallInfo = (ball) => [ball[0], ball.slice(1)];

const updateMatchStatus = (match) => {
  const battingTeam = getBattingTeam(match);
  const bowlingTeam = getBowlingTeam(match);

  const isScoreAboveTarget = match.target <= battingTeam.score;
  const isWicketsDown = battingTeam.wickets === battingTeam.players.length - 1;
  const isOverDone = match.overs * 6 === battingTeam.balls;

  if (match.currentStatus.inning === '1st' && (isWicketsDown || isOverDone)) {
    match.currentStatus = { battingTeam: bowlingTeam.name, inning: '2nd' };
    match.target = battingTeam.score + 1;
    match.inPlay = {
      batsman: null,
      opponentBatsman: null,
      bowler: null,
      currentOver: [],
    };
  }
  if (
    match.currentStatus.inning === '2nd' &&
    (isWicketsDown || isOverDone || isScoreAboveTarget)
  ) {
    match.isMatchCompleted = true;
  }
};

const updateScore = (matches, matchId, ball) => {
  const extrasRunsLookup = {
    '': { runs: 0, ballCount: 1 },
    lb: { runs: 0, ballCount: 1 },
    wk: { runs: 0, ballCount: 1 },
    wd: { runs: 1, ballCount: 0 },
    nb: { runs: 1, ballCount: 0 },
  };

  let match = getMatch(matches, matchId);
  const battingTeam = getBattingTeam(match);
  const bowlingTeam = getBowlingTeam(match);

  updateBatingTeam(extrasRunsLookup, battingTeam, ball, match.inPlay.batsman);
  updateBowlingTeam(extrasRunsLookup, bowlingTeam, ball, match.inPlay.bowler);
  updateInPlayStatus(match, ball);
  updateMatchStatus(match);
  console.log(match);

  return getScoreCard(matches, matchId);
};

module.exports = { updateScore };
