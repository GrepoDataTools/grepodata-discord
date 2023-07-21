const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../utils/logger');
const {handleScoreboardCommand} = require("../common/scoreboard");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alliance')
        .setDescription('Shows the daily alliance scoreboard.')
        .addStringOption(option =>
            option
                .setName('world')
                .setDescription('Optional: enter the world code. For example: \'en134\' or \'nl106\''))
        .addStringOption(option =>
            option
                .setName('day')
                .setDescription("Select today's or yesterday's scoreboard. Default: today")
                .addChoices(
                    {name: 'today', value: 'today'},
                    {name: 'yesterday', value: 'yesterday'},
                )),
    async execute(interaction) {
        try {
            await handleScoreboardCommand(interaction)
        } catch (e) {
            Logger.error(e.stack)
        }
    },
};
