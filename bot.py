import os
import requests
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
)
from dotenv import load_dotenv

load_dotenv()

POCKETBASE_URL = os.getenv("POCKETBASE_URL")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [
        [InlineKeyboardButton("Journal", callback_data="menu:journal")],
        [InlineKeyboardButton("Quotes", callback_data="menu:quotes")],
    ]
    await update.message.reply_text(
        "Choose an option:", reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == "menu:journal":
        await query.edit_message_text("Starting journal...\n(Example Entry Saved)")
        save_journal(
            query.from_user.id,
            "morning",
            {"q1": "Great", "q2": "Focus today"},
        )
    elif data == "menu:quotes":
        await query.edit_message_text("Quotes feature coming soon.")

def save_journal(user_id, routine_type, answers):
    payload = {
        "user_id": str(user_id),
        "routine_type": routine_type,
        "answers": answers
    }
    headers = { "Content-Type": "application/json" }
    r = requests.post(
        f"{POCKETBASE_URL}/api/collections/journal_entries/records",
        json=payload,
        headers=headers,
    )
    return r.ok

def main() -> None:
    application = Application.builder().token(os.getenv("BOT_TOKEN")).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(handle_callback))

    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
