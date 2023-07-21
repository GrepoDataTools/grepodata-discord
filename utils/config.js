const env = require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const Logger = require('./logger');


async function startup() {
    // Create a new client instance
    const client = new Client({intents: [GatewayIntentBits.Guilds], shardCount: 3});

    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    client.once(Events.ClientReady, c => {
        console.log(`Ready! Bot successfully logged in as ${c.user.tag}`);
    });

    // Log in to Discord with your client's token
    Logger.log(`Attempting client login.`);
    client
        .login(process.env.BOT_TOKEN)
        .catch((error) => Logger.error(`Unexpected error while bot login: ${error.message}`))
        .finally(() => Logger.log(`Bot is serving.`));
}

module.exports = startup;
