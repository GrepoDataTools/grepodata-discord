const axios = require('axios');
const Logger = require('../../../utils/logger');
const { MessageEmbed } = require('discord.js');

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

    if (!message.content) {
        message.channel.send(`Please enter a player name to search for. For exmaple: \`!gd search John Doe\`.`);
    } else {
        const heatmapSearchUri = `${process.env.BACKEND_URL}/player/search?query=${encodeURI(
            message.content
        )}&from=0&size=10&sql=true&guild=${message.guild.id}`;
        Logger.log(heatmapSearchUri);
        await axios
            .get(heatmapSearchUri)
            .then(async (response) => {
                const prefix = response.data.count > 10 ? 'Top 10 results' : 'All';
                const guild_has_world =
                    'discord' in response.data &&
                    'guild_has_world' in response.data.discord &&
                    response.data.discord.guild_has_world === true;
                const embed = new MessageEmbed()
                    .setTitle(`${prefix} matching your search: '${message.content}'`)
                    .setDescription(
                        `Due to privacy concerns, the heatmap feature is no longer available.\nInstead we will now show the offline time of the matched players.`
                    )
                    .setFooter(`A player is considered 'active' when they gain at least 1 attack or town point.`);

                // Rows
                let player_list = response.data.results.map((x) => {
                    if ('name' in x) {
                        return `[${x.name}](${process.env.FRONTEND_URL}/player?world=${x.world}&id=${x.id})`;
                    }
                    return '?';
                });
                let world_list = response.data.results.map((x) => {
                    if ('world' in x) {
                        return `[${x.world}](${process.env.FRONTEND_URL}/points?world=${x.world})`;
                    }
                    return '?';
                });
                let online_list = response.data.results.map((x) => {
                    if ('hours_inactive' in x && (x.hours_inactive || x.hours_inactive === 0)) {
                        let hours_inactive = x.hours_inactive;
                        let hours = hours_inactive % 24;
                        let days = Math.floor(hours_inactive / 24);
                        let weeks = Math.floor(hours_inactive / (24 * 7));
                        let months = Math.floor(hours_inactive / (24 * 7 * 30));
                        let time_readable_parts = [];
                        if (months > 0) {
                            time_readable_parts.push(`${months} month${months > 1 ? 's' : ''}`);
                        }
                        if (weeks > 0) {
                            time_readable_parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
                        }
                        if (days > 0) {
                            time_readable_parts.push(`${days} day${days > 1 ? 's' : ''}`);
                        }
                        time_readable_parts.push(`${hours} hour${hours == 1 ? '' : 's'} ago`);
                        let time_readable = time_readable_parts.join(', ');

                        return time_readable;
                    }
                    return '?';
                });

                // Table
                embed
                    .addField('**Player name**', player_list, true)
                    .addField('**Server**', world_list, true)
                    .addField('**Last Activity**', online_list, true);

                if (!guild_has_world) {
                    embed.addField(
                        '**Set a default server to filter your search**',
                        "Use command `!gd server [WORLD]` to set a default world. Your search will then be limited to players within that region. For example if your default server is en135, your search will only return results from 'en' servers.",
                        false
                    );
                }

                message.channel.send({ embed }).catch((error) => {
                    Logger.log(error.message);
                    if (error.message === 'Missing Permissions') {
                        message.channel.send(
                            `Sorry, I can not do that. This Discord channel does not give me the needed permissions to post here :(`
                        );
                    } else {
                        message.channel.send(`Sorry, I can not do that right now`);
                    }
                });
            })
            .catch((error) => {
                Logger.log(error.message);
                message.channel.send(
                    `Could not find any players with a name matching **${message.content}**. Use command \`!gd server [WORLD]\` to change the preferred server for this guild.`
                );
            });
    }
};

exports.config = {
    aliases: ['heatmap', 'search', 'activity', 'active', 'online', 'player', 'players']
};

exports.settings = {
    name: 'search',
    description: 'Shows recent activity of all player matching your search.',
    permLevel: 'User',
    usage: 'search [player name]',
    category: 'Statistics'
};
