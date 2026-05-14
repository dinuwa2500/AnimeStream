import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import dotenv from 'dotenv';
dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession("");

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.start({
    phoneNumber: async () => await input.text("Number: "),
    password: async () => await input.text("Password: "),
    phoneCode: async () => await input.text("Code: "),
    onError: (err) => console.log(err),
  });
  console.log("SUCCESS! Copy this session string to your .env:");
  console.log(client.session.save());
  process.exit(0);
})();
