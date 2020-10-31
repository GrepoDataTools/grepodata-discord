const env = require('dotenv').config();
const discord = require('discord.js');
const Enmap = require('enmap');
const _ = require('lodash');
const Logger = require('./logger');
const Database = require('better-sqlite3');
const database = require('./initialize-database');

const config = {
    ownerID: ['139090652821585920', '124238615684448257'],
    admins: [],
    support: [],
    token: process.env.BOT_TOKEN,
    defaultSettings: {
        prefix: '!gd',
        modLogChannel: 'mod-log',
        modRole: 'Moderator',
        adminRole: 'Administrator',
        systemNotice: 'true',
        welcomeChannel: 'welcome',
        welcomeMessage: 'Say hello to player {{user}}, everyone!',
        welcomeEnabled: 'false'
    },
    permLevels: [
        {
            level: 1,
            name: 'User',
            check: () => true
        },
        {
            level: 2,
            name: 'Moderator',
            check: (message) => {
                try {
                    const modRole = message.guild.roles.find(
                        (role) => role.name.toLocaleLowerCase() === message.settings.modRole.toLowerCase()
                    );
                    if (modRole && message.member.roles.has(modRole.id)) return true;
                } catch (e) {
                    return false;
                }
            }
        },
        {
            level: 3,
            name: 'Administrator',
            check: (message) => {
                try {
                    const adminRole = message.guild.roles.find(
                        (role) => role.name.toLocaleLowerCase() === message.settings.adminRole.toLowerCase()
                    );
                    if (adminRole && message.member.roles.has(adminRole.id)) return true;
                } catch (e) {
                    return false;
                }
            }
        },
        {
            level: 4,
            name: 'Server Owner',
            check: (message) => (message.channel.type === 'text' ? message.guild.ownerID === message.author.id : false)
        },
        {
            level: 5,
            name: 'Bot Support',
            check: (message) => config.support.includes(message.author.id)
        },
        {
            level: 6,
            name: 'Bot Admin',
            check: (message) => config.admins.includes(message.author.id)
        },
        {
            level: 7,
            name: 'Bot owner',
            check: (message) => message.client.config.ownerID.includes(message.author.id)
        }
    ]
};

async function loadBot() {
    if (process.env.ENVIRONMENT === 'development') {
        Logger.log(`Environment set to development.`);
    } else if (process.env.ENVIRONMENT === 'production') {
        Logger.log(`Environment set to production.`);
    } else {
        Logger.error(
            `Environment variable not set. It must be either 'development' or 'production'. Please set it and then start the bot.`
        );
        process.exit();
    }

    const client = new discord.Client();

    client.database = new Database('grepodata.db', { verbose: console.log });
    client.commands = new Enmap();
    client.aliases = new Enmap();
    client.settings = new Enmap({ name: 'settings' });

    database.seed();
    require('./functions')(client);
    require('./settings')(client);
    require('./commands')(client, `./commands`);
    require('./events')(client);

    client.config = config;
    client.levelCache = {};
    for (let i = 0; i < client.config.permLevels.length; i++) {
        const thisLevel = client.config.permLevels[i];
        client.levelCache[thisLevel.name] = thisLevel.level;
    }

    client
        .login(process.env.BOT_TOKEN)
        .then(() => Logger.ready(`Bot successfully logged as ${client.user.username}[${client.user.id}].`))
        .catch((error) => Logger.error(`Unexpected error while bot login: ${error.message}`))
        .finally(() =>
            Logger.log(
                `Bot is serving.`
            )
        );
}

module.exports = loadBot;
