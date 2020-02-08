const { RichEmbed } = require('discord.js');

const createEmbedForStatistics = (statistics) => {
    let attackers = '',
        defenders = '';

    const embed = new RichEmbed();

    statistics.att.slice(0, 10).map((stat, index) => {
        let place = index + 1;

        if (place === 1) stat.emoji = ':first_place:';
        if (place === 2) stat.emoji = ':second_place:';
        if (place === 3) stat.emoji = ':third_place:';

        attackers += `${stat.emoji ? stat.emoji : `#${place}.`} [${stat.n}](https://grepodata.com/player/${
            statistics.world
        }/${stat.i}) - ${stat.s}\n`;
    });

    statistics.def.slice(0, 10).map((stat, index) => {
        let place = index + 1;

        if (place === 1) stat.emoji = ':first_place:';
        if (place === 2) stat.emoji = ':second_place:';
        if (place === 3) stat.emoji = ':third_place:';

        defenders += `${stat.emoji ? stat.emoji : `#${place}.`} [${stat.n}](https://grepodata.com/player/${
            statistics.world
        }/${stat.i}) - ${stat.s}\n`;
    });

    embed
        .setTitle('🏆 Daily scoreboard for ' + statistics.world)
        .setURL(`https://grepodata.com/points/${statistics.world}`)
        .setColor(0x18bc9c)
        .setDescription(`Showing player points gained on ${statistics.date} ${statistics.time}`)
        .addField('**⚔ Best attackers**', attackers, true)
        .addField('**🛡 Best defenders**', defenders, true)
        .addField('\u200B', `[See more 📈](https://grepodata.com/points/${statistics.world})`, false)
        .setFooter(`next update: ${statistics.nextUpdate}`);

    return embed;
};

module.exports = {
    createEmbedForStatistics
};
