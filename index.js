import 'dotenv/config';
import { Markup, Telegraf } from 'telegraf';
import dialog from './answers.js';
// import  Sequalize from "./db";
// import userModel from './model';

let language;
let messagesAreAllowed;
let messageCounter = 0;
let user;
let userId
let isUserBot;
let receiver;

const MESSAGE_PATTERN = "user: { " + user + " }\n" + "user id: { " + userId + " }" + "\n" + "is user bot { " + isUserBot + " }" + "\n" + " USER MESSAGE: \n ";
// const UA_UNICODE_REGEX = /\u0410\u0430\u0411\u0431\u0412\u0432\u0413\u0433\u0490\u0491\u0414\u0434\u0415\u0435\u0404\u0454\u0416\u0436\u0417\u0437\u0418\u0438\u0406\u0456\u0407\u0457\u0419\u0439\u041A\u043A\u041B\u043B\u041C\u043C\u041D\u043D\u041E\u043E\u041F\u043F\u0420\u0440\u0421\u0441\u0422\u0442\u0423\u0443\u0424\u0444\u0425\u0445\u0426\u0446\u0427\u0447\u0428\u0448\u0429\u0449\u042C\u044C\u042E\u044E\u042F\u044F/g
// const ru_UNOCODE_REGEX = /\u0410\u0430\u0411\u0431\u0412\u0432\u0413\u0433\u0414\u0434\u0415\u0435\u0401\u0451\u0416\u0436\u0417\u0437\u0418\u0438\u0419\u0439\u041A\u043A\u041B\u043B\u041C\u043C\u041D\u043D\u041E\u043E\u041F\u043F\u0420\u0440\u0421\u0441\u0422\u0442\u0423\u0443\u0424\u0444\u0425\u0445\u0426\u0446\u0427\u0447\u0428\u0448\u0429\u0449\u042A\u044A\u042B\u044B\u042C\u044C\u042D\u044D\u042E\u044E\u042F\u044F/g
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startAction);
bot.command('restart', startAction);

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
    user = JSON.stringify(msg?.update?.message?.from.username);
    userId = JSON.stringify(msg?.update?.message?.from.id);
    isUserBot = JSON.stringify(msg?.update?.message?.from.is_bot);

    messageCounter = 0;
    messagesAreAllowed = true;

    await msg.reply(dialog.language.general, Markup.inlineKeyboard([
        [
            Markup.button.callback(dialog.language.positions.ua, "ua"),
            Markup.button.callback(dialog.language.positions.ru, "ru")
        ]
    ]));
}

async function onMessageForCollaborant(msg) {
    try {
        // if (msg?.update &&
        //     (msg?.update?.message?.sticker ||
        //         msg?.update?.message?.video ||
        //         //msg?.update?.message?.document ||
        //         //msg?.update?.message?.file ||
        //         // msg?.update?.message?.sticker ||
        //         msg?.update?.message?.animation ||
        //         msg?.update?.message?.voice)) {
        //     msg.deleteMessage(msg.update.message.message_id);
        // }

        messageCounter++
        receiver = process.env.postBox;

        if (messagesAreAllowed) {
            if (msg?.message?.text || msg?.Context?.update?.message?.text) {
                let userMessage = msg.message.text || msg.update.message.text;
                await msg.telegram.sendMessage(receiver, MESSAGE_PATTERN + userMessage);
            }

            if (msg?.update?.message?.photo || msg?.message?.photo) {
                if (msg?.update?.message?.caption || msg?.message?.caption) {
                    await msg.telegram.sendMessage(msg.update.message.caption || msg.message.caption);
                }
                await msg.sendPhoto(receiver, msg.update.message.photo[0].file_id || msg.message.photo[0].file_id);
            }
        }

        if (messageCounter > 2) {
            messagesAreAllowed = false;
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
        !messagesAreAllowed && msg.deleteMessage(msg.update.message.message_id);
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

function setUser(data) {
    user = JSON.stringify(data);
    return user;
}

bot.launch();

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))
