const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of all available commands.'),
    async execute(interaction) {

        let output = `= Command List =\n\n GrepoData bot only responds to slash commands. Start typing '/' to see the options\n\n`;
        output += `/world       :: Set the default game world for this Discord guild\n`;
        output += `/today       :: Show today's player scoreboard\n`;
        output += `/yesterday   :: Show yesterday's player scoreboard\n`;
        output += `/alliance    :: Show alliance scoreboard\n`;
        output += `/search      :: Search for players by name\n`;
        output += `/report    :: Allows you to share a report using the GrepoData indexer userscript\n`;

        await interaction.reply({
            content: '```asciidoc\n' + output + '```',
            // options: { code: 'asciidoc', split: { char: '\u200b' } }
        });
    },
};
