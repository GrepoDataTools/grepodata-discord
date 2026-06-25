const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Logger = require('../utils/logger');

async function sendInteractionResponse(interaction, payload) {
    if (interaction.deferred) {
        return interaction.editReply(payload);
    }
    if (interaction.replied) {
        return interaction.followUp(payload);
    }
    return interaction.reply(payload);
}

async function handleScoreboardCommand(interaction) {
    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
    }

    const guild = interaction.guild.id;
    const command = interaction.commandName;

    // Parse options
    const world = interaction.options.getString('world');
    const yesterdayOpt = interaction.options.getString('day') === 'yesterday';

    const boardtype = command === 'alliance' ? 'alliance' : 'player';
    const yesterday = command === 'yesterday' || yesterdayOpt ? '&yesterday=true' : '';
    const url = world
        ? `${process.env.BACKEND_URL}/scoreboard/${boardtype}?world=${world}&guild=${guild}${yesterday}&minimal=true`
        : `${process.env.BACKEND_URL}/scoreboard/${boardtype}?guild=${guild}${yesterday}&minimal=true`;

    try {
        const response = await axios.get(url);
        const embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
        await sendInteractionResponse(interaction, { embeds: [embed] });
    } catch (e) {
        Logger.error(e.stack);
        await sendInteractionResponse(interaction, { content: 'Something went wrong. Please try again later.' });
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
