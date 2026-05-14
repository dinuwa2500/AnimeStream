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
  if (client.connected) return;
  
  try {
    await client.connect();
    console.log("✅ Telegram Client Connected");
  } catch (err) {
    if (err.message.includes('AUTH_KEY_DUPLICATED')) {
      console.warn("⚠️ Telegram: Auth Key Duplicated. This usually means your local server and Vercel are running at the same time.");
    } else {
      console.error("❌ Telegram Connection Error:", err.message);
    }
  }
};

export { client };
