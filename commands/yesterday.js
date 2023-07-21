const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../utils/logger');
const {handleScoreboardCommand} = require("../common/scoreboard");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yesterday')
        .setDescription('Shows yesterday\'s player scoreboard.')
        .addStringOption(option =>
            option
                .setName('world')
                .setDescription('Optional: enter the world code. For example: \'en134\' or \'nl106\'')),
    async execute(interaction) {
        try {
            await handleScoreboardCommand(interaction)
        } catch (e) {
            Logger.error(e.stack)
        }
    },
};
