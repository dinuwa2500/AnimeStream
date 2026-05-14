import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import dotenv from 'dotenv';

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

export const initTelegram = async () => {
  await client.connect();
  if (client.session.save()) {
    console.log("✅ Telegram Client Connected");
    // If you don't have a session string yet, this script will help you login.
    // I'll add a helper for that in the next step.
  }
};

export { client };
