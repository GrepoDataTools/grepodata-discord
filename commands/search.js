const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../utils/logger');
const {handleSearchCommand} = require("../common/search");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a player by name.')
        .addStringOption(option =>
            option
                .setName('playername')
                .setDescription(`Enter the (partial) name of the player you want to find`)
                .setRequired(true)),
    async execute(interaction) {
        try {
            await handleSearchCommand(interaction)
        } catch (e) {
            Logger.error(e.stack)
        }
    },
};
