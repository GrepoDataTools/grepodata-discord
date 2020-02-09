const { createHeatmapChartForPlayer } = require('../../../utils/grepolis/statistics');
const axios = require('axios');

/**
 * @todo World is hardcoded, re-write once backend is able to send guild's world.
 */
exports.run = async (client, message) => {
    if (message.content.match(/\[player\][0-9]+\[\/player\]/)) {
        message.content = message.content.replace('[player]', '').replace('[/player]', '');
    }

    if (message.content.match(/^[0-9]+$/)) {
        await axios
            .get(`${process.env.BACKEND_URL}/player/info?world=us86&&id=${message.content}`)
            .then(async (response) => {
                const heatmapImage = await createHeatmapChartForPlayer(response.data);

                message.channel.send('', heatmapImage);
            })
            .catch((e) => console.log(e));
    }
};

exports.config = {
    serverRequired: true,
    aliases: []
};

exports.settings = {
    name: 'heatmap'
};
