import 'dotenv/config';
import { Markup, Telegraf } from 'telegraf';
import dialog from './answers.js';

let language;
let messagesAreAllowed;
let messageCounter = 0;
let user;
let userId
let isUserBot;
let receiver;

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(startAction);
bot.command('restart', startAction);

bot.on("message", onMessageForCollaborant);

bot.action("ua", uaAction);
bot.action("ru", ruAction);
bot.action("finish", endChatSendAdvise);
bot.action("forward", forward);

async function startAction(msg) {
    user = JSON.stringify(msg?.update?.message?.from?.username) || JSON.stringify(msg?.message?.chat?.username) || JSON.stringify(msg?.update?.message?.sender_chat?.username);
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
        receiver = process.env.postBox;

        if (messagesAreAllowed) {
            if (msg?.message?.text || msg?.Context?.update?.message?.text) {
                let userMessage = msg.message.text || msg.update.message.text;
                await msg.telegram.sendMessage(receiver, "user: { " + user + " }\n" + "user id: { " + userId + " }" + "\n" + "is user bot { " + isUserBot + " }" + "\n" + " USER MESSAGE: \n " + userMessage);
            }

            if (msg?.update?.message?.photo || msg?.message?.photo || msg?.Context?.update?.message?.photo) {
                let photo = msg?.update?.message?.photo || msg?.message?.photo || msg?.Context?.update?.message?.photo;
                if (photo) {
                    if (msg.update.message.caption) {
                        await msg.telegram.sendMessage(receiver, msg.update.message.caption);
                    }
                    await msg.telegram.sendPhoto(receiver, photo[0].file_id);
                }
            }
        }

        if (messageCounter > 2) {
            messagesAreAllowed = false;
            return stopMessaging(msg);
        }

        messageCounter++

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

function setUser(ctx) {
    user = JSON.stringify(data);

    for (let property in ctx) {
        ctx[property] === "username" || "name" || "userName"
    }

    return user;
}

bot.launch();

// // Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))
