import os
import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Updater,
    CommandHandler,
    CallbackQueryHandler,
    CallbackContext,
)
from dotenv import load_dotenv

load_dotenv()

POCKETBASE_URL = os.getenv("POCKETBASE_URL")

def start(update: Update, context: CallbackContext):
    keyboard = [
        [InlineKeyboardButton("Journal", callback_data="menu:journal")],
        [InlineKeyboardButton("Quotes", callback_data="menu:quotes")],
    ]
    update.message.reply_text("Choose an option:", reply_markup=InlineKeyboardMarkup(keyboard))

def handle_callback(update: Update, context: CallbackContext):
    query = update.callback_query
    query.answer()
    data = query.data

    if data == "menu:journal":
        query.edit_message_text("Starting journal...\n(Example Entry Saved)")
        save_journal(query.from_user.id, "morning", {"q1": "Great", "q2": "Focus today"})
    elif data == "menu:quotes":
        query.edit_message_text("Quotes feature coming soon.")

def save_journal(user_id, routine_type, answers):
    payload = {
        "user_id": str(user_id),
        "routine_type": routine_type,
        "answers": answers
    }
    headers = { "Content-Type": "application/json" }
    r = requests.post(f"{POCKETBASE_URL}/api/collections/journal_entries/records", json=payload, headers=headers)
    return r.ok

def main():
    updater = Updater(os.getenv("BOT_TOKEN"))
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CallbackQueryHandler(handle_callback))
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
