const { SlashCommandBuilder } = require('discord.js');

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
            let world = interaction.options.getString('world');
            const serverIndicator = world.toLowerCase().match(/^([a-z]{2})([0-9]{1,3})$/);
            if (!serverIndicator) {
                interaction.reply(`Please enter a valid world (e.g. en124 or nl79). '${world}' is not valid world.`);
            }
        } catch (e) {
            Logger.error(e.stack)
        }
    },
};
