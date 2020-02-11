const axios = require('axios');
const { createEmbedForStatistics } = require('../../../utils/grepolis/statistics');

exports.run = async (client, message, args, command) => {
    const world = message.content.match(/^([a-z]{2})([0-9]{1,3})/);
    const yesterday = command.includes('yesterday') || command.includes('prev') ? '&yesterday=true' : '';

    if (world) {
        await axios
            .get(
                `${process.env.BACKEND_URL}/scoreboard/player?world=${message.content}&guild=${message.guild.id}${yesterday}&minimal=true`
            )
            .then((response) => {
                const embed = createEmbedForStatistics(response.data, yesterday==='');
                message.channel.send(embed);
            })
            .catch(() => message.channel.send(`Something went wrong. Please try again later.`));
    } else {
        await axios
            .get(`${process.env.BACKEND_URL}/scoreboard/player?guild=${message.guild.id}${yesterday}&minimal=true`)
            .then((response) => {
                const embed = createEmbedForStatistics(response.data, yesterday==='');
                message.channel.send(embed);
            })
            .catch(() => message.channel.send(`Something went wrong. Please try again later.`));
    }
};

exports.config = {
    aliases: ['score', 'today', 'now', 'yesterday', 'prev']
};
exports.settings = {
    name: 'points',
    description: 'Shows worlds statistics',
    usage: 'points (or) points [world - eg. en113]',
    category: 'Statistics'
};
