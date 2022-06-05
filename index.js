import 'dotenv/config';
import { Markup, Telegraf } from 'telegraf';
import dialog from './answers.js';
// import  Sequalize from "./db";
// import userModel from './model';

let language;
let messageCounter = 0;
let user;
let chatId
let timer = 90;
let nonCyrillicLanguageRegex = new RegExp(/a-zA-Z/g);
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startAction);
bot.telegram.setChatMenuButton({ chat_id: chatId, menu_button: "restart" });
// bot.restart((e) => { console.log(e) });
bot.on("message", onMessageForCollaborant.bind(this));
bot.action("ua", uaAction.bind(this));
bot.action("ru", ruAction.bind(this));
bot.action("finish", endChatSendAdvise);
bot.action("forward", forward);


// security
// TODO input regexp control, 
// chat clearing, 
// user blocking,
// add menu explanation - what is collaboration

async function startAction(msg) {
    user = {
        first_name: msg.message.from.first_name,
        last_name: msg.message.from.last_name,
        username: msg.message.from.username,
    }
    chatId = msg.chat.id;
    console.log(chatId)
    await msg.reply(dialog.language.general, Markup.inlineKeyboard([
        [
            Markup.button.callback(dialog.language.positions.ua, "ua"),
            Markup.button.callback(dialog.language.positions.ru, "ru")
        ]
    ]));
}

async function onMessageForCollaborant(msg) {
    try {
        messageCounter++
        if (messageCounter > 2) {
            return stopMessaging(msg);
        }

        await msg.replyWithHTML(dialog.thanks[language], Markup.inlineKeyboard([
            [
                Markup.button.callback(dialog.endChat[language], "finish"),
                Markup.button.callback(dialog.forward[language], "forward")
            ]
        ]));
    } catch (e) {
        console.log(e)
    }

}

async function forward(msg) {
    try {
        msg.reply(dialog.forward_msg[language] + (3 - messageCounter).toString());
    } catch (e) {
        console.log(e)
    }
}

async function endChatSendAdvise(msg) {
    try {
        await msg.reply(dialog.advise[language]);
    } catch (e) {
        console.log(e);
    }
}

async function stopMessaging(msg) {
    try {
        if (messageCounter > 2) {
            await msg.reply(
                dialog.warningMessageLimit[language]
            );
            await endChatSendAdvise(msg);
        }
    } catch (e) {
        console.log(e);
    }
};

async function uaAction(msg) {
    try {
        language = "ua";
        await msg.reply(dialog.set_collaborant[language]);
    } catch (e) {
        console.log(e)
    }
}

async function ruAction(msg) {
    try {
        language = "ru";
        msg.reply(dialog.set_collaborant[language]);
    } catch (e) {
        console.log(e);
    }
}

// async function waitTime(time) {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve(), time);
//     });
// }

bot.launch()

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))
