const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Logger = require('../utils/logger');

async function handleSearchCommand(interaction) {
    try {
        let guild = interaction.guild.id;

        let playername = interaction.options.getString('playername');

        if (playername.match(/\[player\].*\[\/player\]/)) {
            playername = playername
                .replace('[player]', '')
                .replace('[/player]', '')
                .toLowerCase();
        }

        if (!playername) {
            interaction.reply(
                `Please enter a player name to search for. For example: \`/search John Doe\`.`
            );
        } else {
            const searchUri = `${process.env.BACKEND_URL}/player/search?query=${encodeURI(
                playername
            )}&from=0&size=10&sql=true&guild=${guild}`;
            await axios
                .get(searchUri)
                .then(async (response) => {
                    const prefix =
                        response.data.count > 10 ? 'Top 10 results' : `We found ${response.data.count} players`;
                    const guild_has_world =
                        'discord' in response.data &&
                        'guild_has_world' in response.data.discord &&
                        response.data.discord.guild_has_world === true;
                    const embed = new EmbedBuilder()
                        .setTitle(`${prefix} matching your search: '${playername}'`);

                    // Rows
                    let players = response.data.results.map((x) => {
                        try {
                            let name = '?';
                            if ('name' in x) {
                                name = `[${x.name}](${process.env.FRONTEND_URL}/player?world=${x.world}&id=${x.id})`;
                            }
                            let world = '?';
                            if ('world' in x) {
                                world = x.world;
                                // world = `[${x.world}](${process.env.FRONTEND_URL}/points?world=${x.world})`;
                            }
                            let hours_offline = '?';
                            if ('hours_inactive' in x && (x.hours_inactive || x.hours_inactive === 0)) {
                                const hours_inactive = x.hours_inactive;
                                let hours = hours_inactive % 24;
                                let days = Math.floor((hours_inactive % (24 * 7)) / 24);
                                let weeks = Math.floor((hours_inactive % (24 * 30)) / (24 * 7));
                                let months = Math.floor(hours_inactive / (24 * 30));
                                if (months > 0) {
                                    hours_offline = `${months}+ month${months > 1 ? 's' : ''} ago`;
                                } else if (weeks > 0) {
                                    hours_offline = `${weeks}+ week${weeks > 1 ? 's' : ''} ago`;
                                } else if (days > 0) {
                                    hours_offline = `${days}+ day${days > 1 ? 's' : ''} ago`;
                                } else {
                                    hours_offline = `${hours}${hours > 1 ? '+' : ''} hour${
                                        hours === 1 ? '' : 's'
                                    } ago`;
                                }
                            }

                            return `${name} - ${world} - ${hours_offline}`;
                        } catch (e) {
                            Logger.error(e);
                        }
                    });

                    // Table
                    let players_string = players.join('\n')
                    embed.addFields({ name: '**Player name - Server - Last Activity**', value: players_string, inline: true });

                    if (!guild_has_world && response.data.count >= 10) {
                        embed.addFields({
                            name: '**Set a default server to filter your search**',
                            value: "Use command `/world [WORLD]` to set a default world. Your search will then be limited to players within that region. For example if your default server is en135, your search will only return results from 'en' servers.",
                            inline: false
                        });
                    }

                    embed.setFooter(
                            {text: `A player is considered 'active' when they gain at least 1 attack or town point.`}
                        )

                    interaction.reply({embeds: [embed]});
                })
                .catch((error) => {
                    Logger.log(error.stack);
                    interaction.reply(
                        `Could not find any players with a name matching **${playername}**. Use command \`/world [WORLD]\` to change the preferred server for this guild.`
                    );
                });
        }

    } catch (error) {
        Logger.error(error.stack);
        interaction.reply(`Something went wrong. Please try again later.`);
    }
}

module.exports = {
    handleSearchCommand
};
