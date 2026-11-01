const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
    console.error('BOT_TOKEN is missing!');
    process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
    polling: true
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId,
        '🎬 WELCOME TO MOVIE WORLD\n\n' +
        'သင်ကြည့်ချင်တဲ့အမျိုးအစားကို ရွေးချယ်ပါ။',
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🎥 MOVIES',
                            callback_data: 'movies'
                        }
                    ],
                    [
                        {
                            text: '📺 SERIES',
                            callback_data: 'series'
                        }
                    ]
                ]
            }
        }
    );
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'movies') {
        await bot.sendMessage(
            chatId,
            '🎬 MOVIE SECTION\n\nMovie များကို မကြာမီ ထည့်သွင်းပေးပါမည်။'
        );
    }

    if (query.data === 'series') {
        await bot.sendMessage(
            chatId,
            '📺 SERIES SECTION\n\nSeries များကို မကြာမီ ထည့်သွင်းပေးပါမည်။'
        );
    }

    await bot.answerCallbackQuery(query.id);
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('MOVIE WORLD BOT STARTED!');
