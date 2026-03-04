const { Markup } = require('telegraf');

function sendMainMenu(ctx) {
  return ctx.reply(
    'Choose a mode:',
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 Daily Check-In', 'menu:journal')],
      [Markup.button.callback('🎯 Focus Mode', 'menu:focus')],
      [Markup.button.callback('🌿 Break Reset', 'menu:break')],
      [Markup.button.callback('✅ Habit Check-In', 'menu:habits')],
      [Markup.button.callback('💬 Inspiration Quote', 'menu:quotes')],
    ])
  );
}

module.exports = { sendMainMenu };
