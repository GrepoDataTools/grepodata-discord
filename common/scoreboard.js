const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Logger = require('../utils/logger');

async function handleScoreboardCommand(interaction) {
    let guild = interaction.guild.id;
    let command = interaction.commandName;

    // Parse options
    let world = interaction.options.getString('world');
    let yesterday_opt = interaction.options.getString('day') === 'yesterday';

    let boardtype = command === 'alliance' ? 'alliance' : 'player';
    let yesterday = command === 'yesterday' || yesterday_opt ? '&yesterday=true' : '';

    if (world) {
        await axios
            .get(
                `${process.env.BACKEND_URL}/scoreboard/${boardtype}?world=${world}&guild=${guild}${yesterday}&minimal=true`
            )
            .then((response) => {
                let embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
                interaction.reply({embeds: [embed]})
            })
            .catch((e) => {
                Logger.error(e.stack);
                interaction.reply(`Something went wrong. Please try again later.`);
            });
    } else {
        await axios
            .get(
                `${process.env.BACKEND_URL}/scoreboard/${boardtype}?guild=${guild}${yesterday}&minimal=true`
            )
            .then((response) => {
                let embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
                interaction.reply({embeds: [embed]})
            })
            .catch((e) => {
                Logger.error(e.stack);
                interaction.reply(`Something went wrong. Please try again later.`);
            });
    }
}

const createEmbedForStatistics = (statistics, is_today, boardtype) => {
    let attackers = '',
        defenders = '';

    const embed = new EmbedBuilder();

    statistics.att.slice(0, 10).map((stat, index) => {
        let place = index + 1;

        if (place === 1) stat.emoji = ':first_place:';
        if (place === 2) stat.emoji = ':second_place:';
        if (place === 3) stat.emoji = ':third_place:';

        attackers += `${stat.emoji ? stat.emoji : `#${place}.`} [${stat.n}](${
            process.env.FRONTEND_URL
        }/${boardtype}?world=${statistics.world}&id=${stat.i}) - ${stat.s}\n`;
    });

    statistics.def.slice(0, 10).map((stat, index) => {
        let place = index + 1;

        if (place === 1) stat.emoji = ':first_place:';
        if (place === 2) stat.emoji = ':second_place:';
        if (place === 3) stat.emoji = ':third_place:';

        defenders += `${stat.emoji ? stat.emoji : `#${place}.`} [${stat.n}](${
            process.env.FRONTEND_URL
        }/${boardtype}?world=${statistics.world}&id=${stat.i}) - ${stat.s}\n`;
    });

    embed
        .setTitle('🏆 Daily ' + boardtype + ' scoreboard for ' + statistics.world)
        .setURL(`${process.env.FRONTEND_URL}/points?world=${statistics.world}`)
        .setColor(0x18bc9c)
        .setDescription(
            `Showing ${boardtype} points gained on ${statistics.date} ` +
            (is_today ? `before ${statistics.time}` : '(**yesterday**)')
        )
        .addFields(
            { name: '**⚔ Best attackers**', value: attackers, inline: true },
            { name: '**🛡 Best defenders**', value: defenders, inline: true },
            { name: '\u200B', value: `[See more 📈](${process.env.FRONTEND_URL}/points?world=${statistics.world})`, inline: false },
        )
    if (is_today) {
        embed.setFooter({text: `next update expected in: ${statistics.nextUpdate}. Points delay can be up to 2 hours.`});
    }

    return embed;
};

module.exports = {
    handleScoreboardCommand
};
