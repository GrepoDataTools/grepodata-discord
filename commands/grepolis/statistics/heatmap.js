const { createHeatmapChartForPlayer } = require('../../../utils/grepolis/statistics');
const axios = require('axios');

/**
 * @todo World is hardcoded, re-write once backend is able to send guild's world.
 */
exports.run = async (client, message) => {
    if (message.content.match(/\[player\].*\[\/player\]/)) {
        message.content = message.content
            .replace('[player]', '')
            .replace('[/player]', '')
            .toLowerCase();
    }

    if (message.content.match(/^[0-9]+$/)) {
        await axios
            .get(`${process.env.BACKEND_URL}/player/info?world=${message.guild.server}&id=${message.content}`)
            .then(async (response) => {
                const heatmap = await createHeatmapChartForPlayer(response.data);

                message.channel.send(`Heatmap for player ${heatmap.player}`, heatmap.image);
            })
            .catch(() => message.channel.send(`Could not find player with id ${message.content} in world ${message.guild.server}`));
    } else {
        await axios
            .get(
                `${process.env.BACKEND_URL}/player/search?query=${message.content}&from=0&size=1&sql=true&world=${message.guild.server}`
            )
            .then(async (response) => {
                const heatmap = await createHeatmapChartForPlayer(response.data.results[0]);

                message.channel.send(`Heatmap for player ${heatmap.player}`, heatmap.image);
            })
            .catch(() => message.channel.send(`Could not find player with name ${message.content} in world ${message.guild.server}`));
    }
};

exports.config = {
    serverRequired: true,
    aliases: []
};

exports.settings = {
    name: 'heatmap',
    description: 'Shows activity of a player.',
    usage: 'heatmap [player bb code]',
    category: 'Statistics'
};
