const { Markup } = require('telegraf');

function sendMainMenu(ctx) {
  return ctx.reply(
    'Choose an option:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Journal', 'menu:journal')],
      [Markup.button.callback('Quotes', 'menu:quotes')],
    ])
  );
}

module.exports = { sendMainMenu };
