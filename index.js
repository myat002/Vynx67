const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

const OWNER_ID = process.env.OWNER_ID;
const POST_CHANNEL = process.env.POST_CHANNEL || "@movieworld089";
const VIDEO_CHANNEL = process.env.VIDEO_CHANNEL || "@officalstorage";
const JOIN_CHANNEL = process.env.JOIN_CHANNEL || "@movieworld9085";

async function checkJoin(userId) {
  try {
    const member = await bot.getChatMember(JOIN_CHANNEL, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch {
    return false;
  }
}

async function sendVideo(chatId, videoId) {
  try {
    await bot.copyMessage(chatId, VIDEO_CHANNEL, Number(videoId));
  } catch (error) {
    await bot.sendMessage(chatId, "Video ပို့လို့မရပါ။ Admin ကိုဆက်သွယ်ပါ။");
  }
}

bot.onText(/\/start(?:\s+video_(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const videoId = match[1];

  if (!videoId) {
    return bot.sendMessage(chatId, "🎬 Welcome to VynxCinema!");
  }

  const joined = await checkJoin(msg.from.id);

  if (!joined) {
    return bot.sendMessage(chatId, "Video ကြည့်ရန် Channel ကို အရင် Join ပေးပါ။", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "JOIN CHANNEL", url: `https://t.me/${JOIN_CHANNEL.replace("@", "")}` }],
          [{ text: "VERIFY", callback_data: `verify_${videoId}` }]
        ]
      }
    });
  }

  sendVideo(chatId, videoId);
});

bot.on("callback_query", async (query) => {
  if (!query.data.startsWith("verify_")) return;

  const videoId = query.data.replace("verify_", "");
  const joined = await checkJoin(query.from.id);

  await bot.answerCallbackQuery(query.id);

  if (joined) {
    sendVideo(query.from.id, videoId);
  } else {
    bot.sendMessage(query.from.id, "Channel ကို Join လုပ်ပြီးမှ VERIFY နှိပ်ပါ။");
  }
});

bot.onText(/\/publish (.+)/, async (msg, match) => {
  if (String(msg.from.id) !== String(OWNER_ID)) return;

  const parts = match[1].split("|").map(x => x.trim());
  if (parts.length < 2) {
    return bot.sendMessage(msg.chat.id, "အသုံးပြုပုံ: /publish VIDEO_ID | Movie Title | Description");
  }

  const [videoId, title, description = "Watch now"] = parts;

  await bot.sendMessage(POST_CHANNEL,
    `🎬 ${title}\n\n${description}`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "▶ WATCH NOW",
            url: `https://t.me/${(await bot.getMe()).username}?start=video_${videoId}`
          }
        ]]
      }
    }
  );

  bot.sendMessage(msg.chat.id, "Movie Post တင်ပြီးပါပြီ။");
});

console.log("VynxCinema Bot is running!");
