const telegraf = require('telegraf').Telegraf;
const Sequalize = require("./db")
const { Markup, Telegram, Telegraf } = require('telegraf');
const dialog = require('./answers.json');
const userModel = require('./model');
require('dotenv').config();

let language;
let messageCounter = 0;
let chatId;
let user;
let timer = 90;
let hideButton = false;
let messages = [];
let nonCyrillicLanguageRegex = new RegExp(/a-zA-Z/g)

const bot = new telegraf(process.env.BOT_TOKEN)

bot.start(startAction);
bot.action("ua", uaAction.bind(this));
bot.action("ru", ruAction.bind(this));
bot.action("agree", () => { });
bot.action("disagree", msg => { msg.deleteMessage() })
bot.action("finish", clearMessage.bind(this));
bot.action("delete", clearMessage.bind(this));
bot.on("message", onMessageForCollaborant.bind(this));
bot.on("callback_query", (e) => { console.log(e) });

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
    messages.push(msg);
    messages.push(msg.update.message.message_id);
    await msg.reply(dialog.language.general, Markup.inlineKeyboard([
        [
            Markup.button.callback(dialog.language.positions.ua, "ua"),
            Markup.button.callback(dialog.language.positions.ru, "ru")
        ]
    ]));
    await msg.deleteMessage();
}

async function onMessageForCollaborant(msg) {
    try {
        messageCounter++
        if (messageCounter > 2) {
            // warning user about spam
        }
        messages.push(msg);

        await msg.replyWithHTML(dialog.thanks[language], Markup.inlineKeyboard([
            [
                Markup.button.callback(dialog.endChat[language], "finish")
            ]
        ]));
        await msg.deleteMessage();
    } catch (e) {
        console.log(e)
    }

}

async function uaAction(msg) {
    try {
        language = "ua";
        messages.push(msg);
        await msg.answerCbQuery();
        await msg.replyWithHTML(dialog.set_collaborant[language], Markup.inlineKeyboard([
            [
                Markup.button.callback(dialog.agree[language], "agreement"),
                Markup.button.callback(dialog.disagree[language], "disagree")
            ]
        ]));
        await msg.deleteMessage();
    } catch (e) {
        console.log(e)
    }
}

async function ruAction(msg) {
    try {
        language = "ru";
        messages.push(msg);
        await msg.answerCbQuery();
        await msg.replyWithHTML(dialog.set_collaborant[language], Markup.inlineKeyboard([
            [
                Markup.button.callback(dialog.agree[language], "agreement"),
                Markup.button.callback(dialog.disagree[language], "disagree")
            ]
        ]));
        await msg.deleteMessage();
    } catch (e) {
        console.log(e);
    }
}

async function clearMessage(msg) {
    try {
        hideButton = true;
        await msg.deleteMessage();
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
