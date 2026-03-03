require('dotenv').config();
const { Telegraf } = require('telegraf');
const { pb } = require('./pb');
const onboarding = require('./workflows/onboarding');
const journal = require('./workflows/journal');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => onboarding.start(ctx));
bot.command('journal', (ctx) => journal.start(ctx));

bot.on('text', async (ctx, next) => {
  const onboarded = await onboarding.handleText(ctx);
  if (onboarded) return;

  const journaled = await journal.handleText(ctx);
  if (!journaled && next) {
    return next();
  }
});

bot.action('menu:journal', async (ctx) => {
  await ctx.answerCbQuery();
  await journal.start(ctx);
});

bot.action('menu:quotes', async (ctx) => {
  await ctx.answerCbQuery();
  const quote = await getQuoteForUser(String(ctx.from.id));
  const text = quote ? `💬 ${quote}` : 'Add a favourite quote during onboarding to get daily inspiration.';
  await ctx.editMessageText(text);
});

bot.action('ob:yes', (ctx) => onboarding.handleAction(ctx));
bot.action('ob:no', (ctx) => onboarding.handleAction(ctx));

bot.launch();

async function getQuoteForUser(userId) {
  try {
    const user = await pb.collection('profiles').getFirstListItem(`user_id="${userId}"`);
    if (Array.isArray(user.quotes) && user.quotes.length > 0) {
      return user.quotes[Math.floor(Math.random() * user.quotes.length)];
    }
    return null;
  } catch (err) {
    return null;
  }
}
