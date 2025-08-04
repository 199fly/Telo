require('dotenv').config();
const { Telegraf } = require('telegraf');
const onboarding = require('./workflows/onboarding');
const journal = require('./workflows/journal');
const routines = require('../engine/routineRunner');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => onboarding.start(ctx));
bot.command('journal', (ctx) => journal.start(ctx));
bot.command('run', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length < 2) return ctx.reply('Usage: /run <routine_id>');
  return routines.runById(ctx, parts[1]);
});

bot.on('text', async (ctx, next) => {
  const onboarded = await onboarding.handleText(ctx);
  if (onboarded) return;
  const journaled = await journal.handleText(ctx);
  const routine = await routines.handleText(ctx);
  if (!journaled && !routine && next) {
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
bot.on('callback_query', async (ctx, next) => {
  const handled = await routines.handleAction(ctx);
  if (!handled && next) return next();
});

bot.launch();
