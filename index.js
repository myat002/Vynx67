const TelegramBot = require('node-telegram-bot-api');

// BotFather ကရတဲ့ Token ကို ဒီနေရာမှာထည့်ပါ
const TOKEN = 'YOUR_BOT_TOKEN';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId,
        '🎬 WELCOME TO CHILDHOOD MEMORIES\n\n' +
        'သင်ကြည့်ချင်တဲ့ Movie ကို ရွေးချယ်လိုက်ပါ။',
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🎥 WATCH MOVIE',
                            callback_data: 'watch_movie'
                        }
                    ],
                    [
                        {
                            text: '📺 WATCH SERIES',
                            callback_data: 'watch_series'
                        }
                    ]
                ]
            }
        }
    );
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'watch_movie') {
        bot.sendMessage(chatId, '🎬 MOVIE SECTION\n\nMovie များကို မကြာမီ ထည့်သွင်းပေးပါမည်။');
    }

    if (query.data === 'watch_series') {
        bot.sendMessage(chatId, '📺 SERIES SECTION\n\nSeries များကို မကြာမီ ထည့်သွင်းပေးပါမည်။');
    }

    bot.answerCallbackQuery(query.id);
});

console.log('CHILDHOOD MEMORIES BOT STARTED!');
