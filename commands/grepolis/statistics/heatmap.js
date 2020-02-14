const { createHeatmapChartForPlayer } = require('../../../utils/grepolis/statistics');
const axios = require('axios');
const Logger = require('../../../utils/logger');
const { RichEmbed } = require('discord.js');

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

                const embed = new RichEmbed()
                  .setTitle(`Heatmap for player: ${heatmap.player}`)
                  .attachFile(heatmap.image)
                  .setImage('attachment://heatmap.jpg')
                  .setURL(`${process.env.FRONTEND_URL}/player/${message.guild.server}/${message.content}`)
                  .setFooter("A player is considered 'active' when they gain attack points");

                message.channel.send({embed})
                  .catch(error => {
                    Logger.log(error.message);
                    if (error.message == 'Missing Permissions') {
                      message.channel.send(`Sorry, I can not do that. This Discord server does not allow me to upload attachments :(`)
                    } else {
                      message.channel.send(`Sorry, I can not do that right now`)
                    }
                  });
            })
            .catch((error) => {
              Logger.log(error.message);
              message.channel.send(`Could not find player with id ${message.content} in world ${message.guild.server}`)
            });
    } else {
        await axios
            .get(
                `${process.env.BACKEND_URL}/player/search?query=${message.content}&from=0&size=1&sql=true&world=${message.guild.server}`
            )
            .then(async (response) => {
                const player = response.data.results[0];
                const heatmap = await createHeatmapChartForPlayer(player);

                const embed = new RichEmbed()
                  .setTitle(`Heatmap for player: ${player.name}`)
                  .attachFile(heatmap.image)
                  .setImage('attachment://heatmap.jpg')
                  .setURL(`${process.env.FRONTEND_URL}/player/${player.world}/${player.id}`)
                  .setFooter("A player is considered 'active' when they gain attack points");

                message.channel.send({embed})
                  .catch(error => {
                    Logger.log(error.message);
                    if (error.message === 'Missing Permissions') {
                      message.channel.send(`Sorry, I can not do that. This Discord server does not allow me to upload attachments :(`)
                    } else {
                      message.channel.send(`Sorry, I can not do that right now`)
                    }
                  });

            })
            .catch((error) => {
              Logger.log(error.message);
              message.channel.send(`Could not find player with name ${message.content} in world ${message.guild.server}`)
            });
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
