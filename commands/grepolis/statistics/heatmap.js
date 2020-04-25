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

    if (!isNaN(message.content)) {
        await axios
            .get(`${process.env.BACKEND_URL}/player/info?world=${message.guild.server}&id=${message.content}`)
            .then(async (response) => {
                const heatmap = await createHeatmapChartForPlayer(response.data);

                const embed = new RichEmbed()
                  .setTitle(`Heatmap for player: ${heatmap.player}`)
                  .attachFile(heatmap.image)
                  .setImage('attachment://heatmap.jpg')
                  .setURL(`${process.env.FRONTEND_URL}/player?world=${message.guild.server}&id=${message.content}`)
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
              message.channel.send(`Could not find player with id **${message.content}** in world **${message.guild.server}**. Use command \`!gd server [WORLD]\` to change the default world for this guild.`)
            });
    } else {
        const serverName = message.guild.server.substring(0,2);
        const heatmapSearchUri = `${process.env.BACKEND_URL}/player/search?query=${encodeURI(message.content)}&from=0&size=1&sql=true&preferred_server=${serverName}`;
        Logger.log(heatmapSearchUri);
        await axios
            .get(
                heatmapSearchUri
            )
            .then(async (response) => {
                Logger.log(JSON.stringify(response.data.results[0]));
                const player = response.data.results[0];
                const embed = new RichEmbed()
                    .setTitle(`Heatmap for player: ${player.name} (server: ${serverName.toUpperCase()})`)
                    .setURL(`${process.env.FRONTEND_URL}/player?world=${player.world}&id=${player.id}`)
                    .setFooter("A player is considered 'active' when they gain attack points");
                if (!player.heatmap || player.heatmap.length <= 0) {
                    embed
                        .setDescription(`Sorry, it appears [${player.name}](${process.env.FRONTEND_URL}/player?world=${player.world}&id=${player.id}) is not active enough to create a heatmap for.`)
                } else {
                    const heatmap = await createHeatmapChartForPlayer(player);
                    embed
                        .attachFile(heatmap.image)
                        .setImage('attachment://heatmap.jpg')
                }

                message.channel.send({embed})
                    .catch(error => {
                        Logger.log(error.message);
                        if (error.message === 'Missing Permissions') {
                            message.channel.send(`Sorry, I can not do that. This Discord channel does not allow me to upload attachments :(`)
                        } else {
                            message.channel.send(`Sorry, I can not do that right now`)
                        }
                    });

            })
            .catch((error) => {
              Logger.log(error.message);
              message.channel.send(`Could not find player with name **${message.content}** in world **${message.guild.server}**. Use command \`!gd server [WORLD]\` to change the default world for this guild.`)
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
