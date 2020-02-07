const env = require('dotenv').config();
const discord = require('discord.js');
const _ = require('lodash');
const Logger = require('./logger');

function loadBot() {
    if (process.env.ENVIRONMENT === 'development') {
        Logger.log(`Environment set to development.`)
    } else if (process.env.ENVIRONMENT === 'production') {
        Logger.log(`Environment set to production.`)
    } else {
        Logger.error(`Environment variable not set. It must be either 'development' or 'production'. Please set it and then start the bot.`)
        process.exit();
    }

    const client = new discord.Client();
    client.login(process.env.BOT_TOKEN)
        .then(() => Logger.ready(`Bot successfully logged as ${client.user.username}[${client.user.id}].`))
        .catch((error) => Logger.error(`Unexpected error while bot login: ${error.message}`))
        .finally(() =>
            Logger.log(`Bot is serving for ${client.guilds.reduce((acc, val) => acc + val.memberCount, 0)} users in ${_.size(client.guilds)} guilds.`)
        );
}

module.exports = loadBot;