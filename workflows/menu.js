const { Markup } = require('telegraf');

function sendMainMenu(ctx) {
  return ctx.reply(
    'Choose a routine:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Daily Check-In', 'menu:journal')],
      [Markup.button.callback('Inspiration Quote', 'menu:quotes')],
    ])
  );
}

module.exports = { sendMainMenu };
