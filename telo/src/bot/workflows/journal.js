const pb = require('../../api/pocketbase');
const { sendMainMenu } = require('./menu');

const awaitingEntry = {};

async function start(ctx) {
  const userId = String(ctx.from.id);
  awaitingEntry[userId] = true;
  await ctx.reply('What would you like to journal about today?', {
    reply_markup: { force_reply: true },
  });
}

async function handleText(ctx) {
  const userId = String(ctx.from.id);
  if (!awaitingEntry[userId]) return false;

  await pb.collection('journal_entries').create({
    user_id: userId,
    routine_type: 'free',
    answers: { text: ctx.message.text },
  });

  awaitingEntry[userId] = false;
  await ctx.reply('Journal entry saved.');
  await sendMainMenu(ctx);
  return true;
}

module.exports = { start, handleText };
