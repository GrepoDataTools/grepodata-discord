const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const Logger = require('../utils/logger');
const {handleScoreboardCommand} = require("../common/scoreboard");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('world')
        .setDescription('Set the default world for this server.')
        .addStringOption(option =>
            option
                .setName('world')
                .setDescription('Enter the world code. For example: \'en134\' or \'nl106\'')
                .setRequired(true)),
    async execute(interaction) {
        try {
            let guild = interaction.guild.id;
            let world = interaction.options.getString('world');
            const serverIndicator = world.toLowerCase().match(/^([a-z]{2})([0-9]{1,3})$/);
            if (!serverIndicator) {
                interaction.reply(`Please enter a valid world (e.g. en124 or nl79). '${world}' is not valid world.`);
            }

            await axios
                .get(`${process.env.BACKEND_URL}/discord/set_server?guild=${guild}&server=${world}`)
                .then(() => {
                    interaction.reply(
                        `\`Server for this guild was successfully set to ${world}\``
                    );
                })
                .catch((error) => {
                    Logger.error(error.stack)
                    const { data } = error.response;
                    if (error.response.status === 404) {
                        interaction.reply(`\`Unable to find world '${world}'.\``);
                    } else {
                        interaction.reply(
                            `\`Unable to update server for this guild. Please try again later or contact us if this error persists.\``
                        );
                    }
                });

        } catch (e) {
            Logger.error(e.stack)
        }
    },
};
