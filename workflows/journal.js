const pb = require('../pb');
const { sendMainMenu } = require('./menu');
const { startRoutine, handleRoutineText } = require('./routines');

async function start(ctx) {
  const userId = String(ctx.from.id);
  const user = await findUser(userId);
  const quote = pickQuote(user?.quotes);

  if (quote) {
    await ctx.reply(`💬 ${quote}`);
  }

  if (user?.goal) {
    await ctx.reply(`🎯 Goal reminder: ${user.goal}`);
  }

  await startRoutine(ctx, 'daily_checkin');
}

async function handleText(ctx) {
  const routineResult = await handleRoutineText(ctx);
  if (!routineResult) return false;

  if (routineResult.completed) {
    await sendMainMenu(ctx);
  }

  return true;
}

async function findUser(userId) {
  try {
    return await pb.collection('users').getFirstListItem(`user_id="${userId}"`);
  } catch (err) {
    return null;
  }
}

function pickQuote(quotes) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

module.exports = { start, handleText };
