
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is missing");

const bot = new TelegramBot(token, { polling: true });

const OWNER_ID = process.env.OWNER_ID;
const POST_CHANNEL = "@movieworld089";
const VIDEO_CHANNEL = "@moviestorage09";

const REQUIRED_CHANNELS = [
  "@movieworld089",
  "@movieworld9085"
];

async function checkJoin(userId) {
  for (const channel of REQUIRED_CHANNELS) {
    try {
      const member = await bot.getChatMember(channel, userId);

      if (!["member", "administrator", "creator"].includes(member.status)) {
        return false;
      }
    } catch (error) {
      console.log("Join check error:", error.message);
      return false;
    }
  }

  return true;
}

function joinButtons(videoId) {
  return {
    inline_keyboard: [
      [{
        text: "JOIN POST CHANNEL",
        url: "https://t.me/movieworld089"
      }],
      [{
        text: "JOIN MOVIE WORLD",
        url: "https://t.me/movieworld9085"
      }],
      [{
        text: "VERIFY & WATCH",
        callback_data: "verify_" + videoId
      }]
    ]
  };
}

async function sendVideo(chatId, videoId) {
  try {
    await bot.copyMessage(
      chatId,
      VIDEO_CHANNEL,
      Number(videoId)
    );
  } catch (error) {
    console.log("Video error:", error.message);
  }
}

bot.onText(/\/start(?:\s+video_(\d+))?/, async (msg, match) => {
  const videoId = match[1];

  if (!videoId) {
    return bot.sendMessage(
      msg.chat.id,
      "🎬 Welcome to VynxCinema!\nMovie Post ထဲက WATCH NOW ကိုနှိပ်ပါ။"
    );
  }

  const joined = await checkJoin(msg.from.id);

  if (!joined) {
    return bot.sendMessage(
      msg.chat.id,
      "Video ကြည့်ရန် Channel နှစ်ခုလုံး Join လုပ်ပါ။",
      { reply_markup: joinButtons(videoId) }
    );
  }

  await sendVideo(msg.chat.id, videoId);
});

bot.on("callback_query", async (query) => {
  if (!query.data.startsWith("verify_")) return;

  const videoId = query.data.replace("verify_", "");

  await bot.answerCallbackQuery(query.id);

  const joined = await checkJoin(query.from.id);

  if (!joined) {
    return bot.sendMessage(
      query.from.id,
      "Channel နှစ်ခုလုံး Join လုပ်ပြီး VERIFY ထပ်နှိပ်ပါ။",
      { reply_markup: joinButtons(videoId) }
    );
  }

  await sendVideo(query.from.id, videoId);
});

bot.onText(/\/publish (.+)/, async (msg, match) => {
  if (!OWNER_ID || String(msg.from.id) !== String(OWNER_ID)) {
    return bot.sendMessage(msg.chat.id, "Admin only.");
  }

  const parts = match[1].split("|").map(x => x.trim());

  if (parts.length < 2 || !/^\d+$/.test(parts[0])) {
    return bot.sendMessage(
      msg.chat.id,
      "အသုံးပြုပုံ:\n/publish VIDEO_ID | Movie Title | Description"
    );
  }

  const [videoId, title, description = "Watch now"] = parts;

  try {
    const me = await bot.getMe();

    await bot.sendMessage(
      POST_CHANNEL,
      `🎬 ${title}\n\n${description}`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "▶ WATCH NOW",
              url: `https://t.me/${me.username}?start=video_${videoId}`
            }
          ]]
        }
      }
    );

    await bot.sendMessage(msg.chat.id, "✅ Post တင်ပြီးပါပြီ။");

  } catch (error) {
    console.log(error.message);
    await bot.sendMessage(
      msg.chat.id,
      "Post မတင်နိုင်ပါ။ Bot Admin ခွင့်စစ်ပါ။"
    );
  }
});

bot.on("polling_error", error => {
  console.log("Polling error:", error.message);
});

console.log("VynxCinema Bot is running!");
  
