const { Markup } = require('telegraf');
const pb = require('../pb');

function registerOnboarding(bot, showMainMenu) {
  const state = {};

  bot.start(async (ctx) => {
    const userId = String(ctx.from.id);
    let user;
    try {
      user = await pb.collection('users').getOne(userId);
    } catch (e) {
      user = null;
    }
    if (user) {
      return showMainMenu(ctx);
    }
    state[userId] = { step: 'goal', data: { quotes: [], habits: [] } };
    await ctx.reply('Welcome to TELO! What is your main personal goal?');
  });

  bot.on('text', async (ctx) => {
    const userId = String(ctx.from.id);
    const s = state[userId];
    if (!s) return;
    const text = ctx.message.text.trim();

    if (s.step === 'goal') {
      s.data.goal = text;
      s.step = 'quotes';
      s.quoteCount = 0;
      return ctx.reply('Great! Share an inspirational quote (or type "skip" to skip).');
    }

    if (s.step === 'quotes') {
      if (text.toLowerCase() !== 'skip') {
        s.data.quotes.push(text);
        s.quoteCount++;
      }
      if (s.quoteCount < 3 && text.toLowerCase() !== 'skip') {
        return ctx.reply('Another quote? (or type "skip")');
      }
      s.step = 'goodHabit';
      return ctx.reply('Name one good habit you want to build:');
    }

    if (s.step === 'goodHabit') {
      s.data.habits.push({ name: text, type: 'good', count_today: 0 });
      s.step = 'badHabit';
      return ctx.reply('Name one bad habit you want to reduce:');
    }

    if (s.step === 'badHabit') {
      s.data.habits.push({ name: text, type: 'bad', count_today: 0 });
      try {
        await pb.collection('users').create({ id: userId, ...s.data });
        await ctx.reply('Onboarding complete!');
      } catch (e) {
        console.error('Failed to save user', e.message);
        await ctx.reply('Sorry, failed to save your data.');
      }
      delete state[userId];
      return showMainMenu(ctx);
    }
  });
}

module.exports = registerOnboarding;
