const pb = require('../../api/pocketbase');
const { Markup } = require('telegraf');
const { sendMainMenu } = require('./menu');

const onboardingState = {};

async function start(ctx) {
  const userId = String(ctx.from.id);
  let user;
  try {
    user = await pb.collection('users').getFirstListItem(`user_id="${userId}"`);
  } catch (e) {
    user = null;
  }

  if (!user) {
    onboardingState[userId] = { stage: 'first_name', data: {} };
    await ctx.reply(
      "👋 Welcome to TELO! I'm here to help you focus and reflect each day. Let's set up your profile."
    );
    return ctx.reply('What is your first name?', {
      reply_markup: { force_reply: true },
    });
  }

  return sendMainMenu(ctx);
}

async function handleText(ctx) {
  const userId = String(ctx.from.id);
  const state = onboardingState[userId];
  if (!state) return false;

  if (state.stage === 'first_name') {
    state.data.first_name = ctx.message.text.trim();
    state.stage = 'username';
    await ctx.reply('Great! What username should I call you?', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  if (state.stage === 'username') {
    state.data.username = ctx.message.text.trim();
    state.stage = 'goal';
    await ctx.reply('Thanks! What is your main goal right now?', {
      reply_markup: { force_reply: true },
    });
    return true;
  }

  if (state.stage === 'goal') {
    state.data.goal = ctx.message.text.trim();
    state.stage = 'quotes_prompt';
    await ctx.reply(
      'Would you like to add a favourite quote?',
      Markup.inlineKeyboard([
        Markup.button.callback('Yes', 'ob:yes'),
        Markup.button.callback('No', 'ob:no'),
      ])
    );
    return true;
  }

  if (state.stage === 'quotes') {
    state.data.quotes = [ctx.message.text.trim()];
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
    await ctx.editMessageText('No problem, we can add quotes later.');
    await finalize(ctx, userId, state.data);
    return true;
  }

  return false;
}

async function finalize(ctx, userId, data) {
  await pb.collection('users').create({
    user_id: userId,
    first_name: data.first_name,
    username: data.username,
    goal: data.goal,
    quotes: data.quotes,
  });
  delete onboardingState[userId];
  await ctx.reply(
    "You're all set! Let's make every day intentional and productive. 🚀"
  );
  await sendMainMenu(ctx);
}

module.exports = { start, handleText, handleAction };
