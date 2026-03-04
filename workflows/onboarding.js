const { pb, ensureAdminAuth } = require('../pb');
const { Markup } = require('telegraf');
const { sendMainMenu } = require('./menu');

const onboardingState = {};

async function start(ctx) {
  const userId = String(ctx.from.id);
  let user;
  try {
    user = await pb.collection('profiles').getFirstListItem(`user_id="${userId}"`);
  } catch (e) {
    user = null;
  }

  if (!user) {
    onboardingState[userId] = { stage: 'first_name', data: {} };
    await ctx.reply(
      "👋 Welcome to TELO! I'll help you run intentional journaling, focus, breaks, and habits."
    );
    await ctx.reply('Step 1/6 — What is your first name?', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  return sendMainMenu(ctx);
}

async function handleText(ctx) {
  const userId = String(ctx.from.id);
  const state = onboardingState[userId];
  if (!state) return false;

  const input = ctx.message.text.trim();

  if (state.stage === 'first_name') {
    state.data.first_name = input;
    state.stage = 'username';
    await ctx.reply('Step 2/6 — What username should I call you?', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  if (state.stage === 'username') {
    state.data.username = input;
    state.stage = 'goal';
    await ctx.reply('Step 3/6 — What is your main goal right now?', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  if (state.stage === 'goal') {
    state.data.goal = input;
    state.stage = 'focus_minutes';
    await ctx.reply('Step 4/6 — Preferred focus sprint length in minutes? (e.g. 25)', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  if (state.stage === 'focus_minutes') {
    const parsed = Number(input);
    if (!Number.isFinite(parsed) || parsed < 10 || parsed > 120) {
      await ctx.reply('Please share a number between 10 and 120 minutes.');
      await ctx.reply('Step 4/6 — Preferred focus sprint length in minutes?', {
        reply_markup: { force_reply: true },
      });
      return true;
    }

    state.data.focus_minutes = parsed;
    state.stage = 'habits';
    await ctx.reply(
      'Step 5/6 — List 1-3 habits you want to track (comma-separated).\nExample: Read 10 pages, Workout, No sugar',
      { reply_markup: { force_reply: true } }
    );
    return true;
  }

  if (state.stage === 'habits') {
    const habits = input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    state.data.habits = habits;
    state.stage = 'quotes_prompt';
    await ctx.reply(
      'Step 6/6 — Would you like to add a favourite quote?',
      Markup.inlineKeyboard([
        Markup.button.callback('Yes', 'ob:yes'),
        Markup.button.callback('No', 'ob:no'),
      ])
    );
    return true;
  }

  if (state.stage === 'quotes') {
    state.data.quotes = [input];
    await finalize(ctx, userId, state.data);
    return true;
  }

  return false;
}

async function handleAction(ctx) {
  const userId = String(ctx.from.id);
  const state = onboardingState[userId];
  if (!state) return false;

  if (ctx.callbackQuery.data === 'ob:yes') {
    state.stage = 'quotes';
    await ctx.answerCbQuery();
    await ctx.reply('Awesome! Send me your favourite quote:', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  if (ctx.callbackQuery.data === 'ob:no') {
    state.data.quotes = [];
    await ctx.answerCbQuery();
    await ctx.editMessageText('Perfect. You can add quotes later anytime.');
    await finalize(ctx, userId, state.data);
    return true;
  }

  return false;
}

async function finalize(ctx, userId, data) {
  await ensureAdminAuth();
  await pb.collection('profiles').create({
    user_id: userId,
    first_name: data.first_name,
    username: data.username,
    goal: data.goal,
    focus_minutes: data.focus_minutes,
    habits: data.habits,
    quotes: data.quotes,
  });

  delete onboardingState[userId];

  await ctx.reply(
    '✅ You are set up. Use the menu to run Daily Check-In, Focus Mode, Break Reset, or Habit Check-In.'
  );
  await sendMainMenu(ctx);
}

module.exports = { start, handleText, handleAction };
