const { MessageEmbed } = require('discord.js');
const { CanvasRenderService } = require('chartjs-node-canvas');
const { MessageAttachment } = require('discord.js');

const createEmbedForStatistics = (statistics, is_today, boardtype) => {
    let attackers = '',
        defenders = '';

    const embed = new MessageEmbed();

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
        .addField('**⚔ Best attackers**', attackers, true)
        .addField('**🛡 Best defenders**', defenders, true)
        .addField('\u200B', `[See more 📈](${process.env.FRONTEND_URL}/points?world=${statistics.world})`, false);
    if (is_today) {
        let otherType = boardtype === 'player' ? 'alliance' : 'player';
        embed.setFooter(`next update expected in: ${statistics.nextUpdate}. Points delay can be up to 2 hours.`);
    }

    return embed;
};

const createErrorEmbed = (title, description) => {
    return new MessageEmbed()
        .setTitle(title)
        .setColor(0xea6153)
        .setDescription(description);
};

module.exports = {
    createEmbedForStatistics,
    createErrorEmbed
};
