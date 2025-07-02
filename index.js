require('dotenv').config();
const { Telegraf } = require('telegraf');
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
  await ctx.editMessageText('Quotes feature coming soon.');
});

bot.action('ob:yes', (ctx) => onboarding.handleAction(ctx));
bot.action('ob:no', (ctx) => onboarding.handleAction(ctx));

bot.launch();
