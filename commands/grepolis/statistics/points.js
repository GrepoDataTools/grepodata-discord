const axios = require('axios');
const Logger = require('../../../utils/logger');
const { createEmbedForStatistics } = require('../../../utils/grepolis/statistics');

exports.run = async (client, message, args, command) => {
    const world = message.content.match(/^([a-z]{2})([0-9]{1,3})/);
    const yesterday = command.includes('yesterday') || command.includes('prev') ? '&yesterday=true' : '';

    let boardtype = 'player';
    if (
        message.content === 'alliance' ||
        message.content === 'ally' ||
        message.content === 'alli' ||
        message.content === 'all'
    ) {
        boardtype = 'alliance';
    }
    if (world) {
        await axios
            .get(
                `${process.env.BACKEND_URL}/scoreboard/${boardtype}?world=${message.content}&guild=${message.guild.id}${yesterday}&minimal=true`
            )
            .then((response) => {
                const embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
                message.channel.send(embed);
            })
            .catch((e) => {
                Logger.error(e);
                message.channel.send(`Something went wrong. Please try again later.`);
            });
    } else {
        await axios
            .get(
                `${process.env.BACKEND_URL}/scoreboard/${boardtype}?guild=${message.guild.id}${yesterday}&minimal=true`
            )
            .then((response) => {
                const embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
                message.channel.send(embed);
            })
            .catch((e) => {
                Logger.error(e);
                message.channel.send(`Something went wrong. Please try again later.`);
            });
    }
};

exports.config = {
    aliases: ['score', 'today', 'now', 'yesterday', 'prev']
};
exports.settings = {
    name: 'points',
    description: 'Shows the daily scoreboard of the active world. Usage: "!gd points en134"',
    permLevel: 'User',
    usage: 'points (or) points [world] (e.g. en113, nl74, us76)',
    category: 'Statistics'
};
