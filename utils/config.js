const env = require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const Logger = require('./logger');


async function startup() {
    // Create a new client instance
    const client = new Client({intents: [GatewayIntentBits.Guilds], shardCount: 3});

    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    client.once(Events.ClientReady, c => {
        Logger.log(`Ready! Bot successfully logged in as ${c.user.tag}`);
    });

    // Reload commands
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            Logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    // handle interactions
    client.on(Events.InteractionCreate, async interaction => {
        try {
            if (!interaction.isChatInputCommand()) return;

            Logger.log(
                `[INTERACTION] ${interaction.member.user.username}(${interaction.member.user.id}, guild ${interaction.guild.id}) ran interaction ${interaction.commandName}`
            );

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                Logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                Logger.error(error.stack);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } catch (error) {
            Logger.error(error.stack);
        }
    });

    // Log in to Discord with client token
    Logger.log(`Attempting client login.`);
    client
        .login(process.env.BOT_TOKEN)
        .catch((error) => Logger.error(`Unexpected error while bot login: ${error.message}`))
        .finally(() => Logger.log(`Bot is serving.`));
}

module.exports = startup;
