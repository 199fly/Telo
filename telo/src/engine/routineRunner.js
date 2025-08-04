const { Markup } = require('telegraf');
const { writeLog } = require('./logEngine');
const pb = require('../api/pocketbase');

const runners = {};

function start(ctx, routine) {
  const userId = String(ctx.from.id);
  runners[userId] = { routine, index: 0, data: {} };
  return handleNextStep(ctx, userId);
}

async function handleNextStep(ctx, userId) {
  const state = runners[userId];
  if (!state) return;
  const step = state.routine.steps[state.index];
  if (!step) {
    await writeLog(userId, state.routine.module || state.routine.id, state.data);
    await ctx.reply('Routine complete and logged.');
    delete runners[userId];
    return;
  }

  if (step.type === 'message') {
    await ctx.reply(step.text);
    state.index++;
    return handleNextStep(ctx, userId);
  }

  if (step.type === 'question') {
    await ctx.reply(step.text, { reply_markup: { force_reply: true } });
    state.awaiting = step.key;
    return;
  }

  if (step.type === 'counter') {
    state.data[step.key] = step.default || 0;
    state.awaiting = step.key;
    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('➖', `ctr:-:${step.key}`), Markup.button.callback('➕', `ctr:+:${step.key}`)],
      [Markup.button.callback('Done', `ctr:done:${step.key}`)],
    ]);
    await ctx.reply(step.text, buttons);
    return;
  }

  if (step.type === 'log') {
    Object.keys(step.data).forEach(k => {
      const val = step.data[k];
      state.data[k] = typeof val === 'string' && val.startsWith('{{')
        ? state.data[val.slice(2, -2)]
        : val;
    });
    state.index++;
    return handleNextStep(ctx, userId);
  }
}

async function handleText(ctx) {
  const userId = String(ctx.from.id);
  const state = runners[userId];
  if (!state || !state.awaiting) return false;
  state.data[state.awaiting] = ctx.message.text;
  state.index++;
  state.awaiting = null;
  await handleNextStep(ctx, userId);
  return true;
}

async function handleAction(ctx) {
  const userId = String(ctx.from.id);
  const state = runners[userId];
  if (!state || !state.awaiting) return false;
  const [prefix, action, key] = ctx.callbackQuery.data.split(':');
  if (prefix !== 'ctr' || key !== state.awaiting) return false;
  await ctx.answerCbQuery();
  if (action === '+' ) state.data[key]++;
  if (action === '-' ) state.data[key]--;
  if (action === 'done') {
    state.index++;
    state.awaiting = null;
    await ctx.editMessageReplyMarkup();
    await handleNextStep(ctx, userId);
  } else {
    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('➖', `ctr:-:${key}`), Markup.button.callback('➕', `ctr:+:${key}`)],
      [Markup.button.callback('Done', `ctr:done:${key}`)],
    ]);
    await ctx.editMessageReplyMarkup(buttons.reply_markup);
  }
  return true;
}

async function runById(ctx, id) {
  try {
    const routine = await pb.collection('routines').getOne(id);
    return start(ctx, routine);
  } catch (e) {
    await ctx.reply('Routine not found.');
  }
}

module.exports = { start, handleText, handleAction, runById };

