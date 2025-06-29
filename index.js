require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
const POCKETBASE_URL = process.env.POCKETBASE_URL;

bot.start((ctx) => {
  return ctx.reply(
    'Choose an option:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Journal', 'menu:journal')],
      [Markup.button.callback('Quotes', 'menu:quotes')],
    ])
  );
});

bot.action('menu:journal', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText('Starting journal...\n(Example Entry Saved)');
  await saveJournal(ctx.from.id, 'morning', { q1: 'Great', q2: 'Focus today' });
});

bot.action('menu:quotes', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText('Quotes feature coming soon.');
});

async function saveJournal(userId, routineType, answers) {
  try {
    await axios.post(
      `${POCKETBASE_URL}/api/collections/journal_entries/records`,
      {
        user_id: String(userId),
        routine_type: routineType,
        answers,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Failed to save journal', e.message);
  }
}

bot.launch();
