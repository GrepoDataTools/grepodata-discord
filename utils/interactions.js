const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const Logger = require('./logger');
const { createEmbedForStatistics } = require('./grepolis/statistics');
const { MessageAttachment, MessageEmbed } = require('discord.js');

module.exports = async (client) => {
    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        Logger.log(
            `[INTERACTION] ${interaction.member.user.username}(${interaction.member.user.id}, guild ${interaction.guild_id}) ran interaction ${interaction.data.name}`
        );

        let guild = interaction.guild_id;
        let command = interaction.data.name;

        let world = null;
        let yesterday_opt = false;
        let hashid = null;
        let playername = null;
        if ('options' in interaction.data) {
            interaction.data.options.map((option) => {
                switch (option.name) {
                    case 'world':
                        world = option.value;
                        break;
                    case 'day':
                        yesterday_opt = option.value === 'yesterday';
                        break;
                    case 'hash':
                        hashid = option.value;
                        break;
                    case 'playername':
                        playername = option.value;
                        break;
                }
            });
        }

        switch (command) {
            case 'today':
            case 'yesterday':
            case 'alliance':
                // scoreboard

                let boardtype = command === 'alliance' ? 'alliance' : 'player';
                let yesterday = command === 'yesterday' || yesterday_opt ? '&yesterday=true' : '';

                if (world) {
                    await axios
                        .get(
                            `${process.env.BACKEND_URL}/scoreboard/${boardtype}?world=${world}&guild=${guild}${yesterday}&minimal=true`
                        )
                        .then((response) => {
                            let embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
                            interactionReplyEmbed(client, interaction, embed);
                        })
                        .catch((e) => {
                            Logger.error(e);
                            interactionReply(client, interaction, `Something went wrong. Please try again later.`);
                        });
                } else {
                    await axios
                        .get(
                            `${process.env.BACKEND_URL}/scoreboard/${boardtype}?guild=${guild}${yesterday}&minimal=true`
                        )
                        .then((response) => {
                            let embed = createEmbedForStatistics(response.data, yesterday === '', boardtype);
                            interactionReplyEmbed(client, interaction, embed);
                        })
                        .catch((e) => {
                            Logger.error(e);
                            interactionReply(client, interaction, `Something went wrong. Please try again later.`);
                        });
                }

                break;
            case 'world':
                // set world

                const serverIndicator = world.toLowerCase().match(/^([a-z]{2})([0-9]{1,3})$/);
                if (!serverIndicator) {
                    interactionReply(
                        client,
                        interaction,
                        `Please enter a valid world (e.g. en124 or nl79). ${world} is not valid world.`
                    );
                }

                await axios
                    .get(`${process.env.BACKEND_URL}/discord/set_server?guild=${guild}&server=${world}`)
                    .then(() => {
                        interactionReply(
                            client,
                            interaction,
                            `\`Server for this guild was successfully set to ${world}\``
                        );
                    })
                    .catch((error) => {
                        const { data } = error.response;
                        if (error.response.status === 404) {
                            interactionReply(client, interaction, `\`Unable to find world '${world}'.\``);
                        } else {
                            interactionReply(
                                client,
                                interaction,
                                `\`Unable to update server for this guild. Please try again later or contact us if this error persists.\``
                            );
                        }
                    });

                break;
            case 'search':
                // search players

                if (playername.match(/\[player\].*\[\/player\]/)) {
                    playername = playername
                        .replace('[player]', '')
                        .replace('[/player]', '')
                        .toLowerCase();
                }

                if (!playername) {
                    interactionReply(
                        client,
                        interaction,
                        `Please enter a player name to search for. For exmaple: \`/search John Doe\`.`
                    );
                } else {
                    const searchUri = `${process.env.BACKEND_URL}/player/search?query=${encodeURI(
                        playername
                    )}&from=0&size=10&sql=true&guild=${guild}`;
                    Logger.log(searchUri);
                    await axios
                        .get(searchUri)
                        .then(async (response) => {
                            const prefix =
                                response.data.count > 10 ? 'Top 10 results' : `We found ${response.data.count} players`;
                            const guild_has_world =
                                'discord' in response.data &&
                                'guild_has_world' in response.data.discord &&
                                response.data.discord.guild_has_world === true;
                            const embed = new MessageEmbed()
                                .setTitle(`${prefix} matching your search: '${playername}'`)
                                .setFooter(
                                    `A player is considered 'active' when they gain at least 1 attack or town point.`
                                );

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
                            embed.addField('**Player name - Server - Last Activity**', players, false);

                            if (!guild_has_world && response.data.count >= 10) {
                                embed.addField(
                                    '**Set a default server to filter your search**',
                                    "Use command `/world [WORLD]` to set a default world. Your search will then be limited to players within that region. For example if your default server is en135, your search will only return results from 'en' servers.",
                                    false
                                );
                            }

                            interactionReplyEmbed(client, interaction, embed);
                        })
                        .catch((error) => {
                            Logger.log(error.message);
                            interactionReply(
                                client,
                                interaction,
                                `Could not find any players with a name matching **${playername}**. Use command \`/world [WORLD]\` to change the preferred server for this guild.`
                            );
                        });
                }

                break;
            case 'gdreport':
                // share report

                interactionReply(
                    client,
                    interaction,
                    `Sorry, this function is currently not available due to a Discord API update. We are working on a fix.`
                );
                break;

                // hashid = hashid.replace('hash: ', '').replace('/gdreport ', '');
                // if (hashid.length > 24 || !/^r?m?-?\d{2,24}$/.test(hashid)) {
                //     interactionReply(
                //         client,
                //         interaction,
                //         `Sorry, **'${hashid}'** is not a valid report link.\n` +
                //             `Tip: Install the GrepoData indexer userscript to share reports via Discord.\nRead more: [grepodata.com/indexer](https://grepodata.com/indexer)`
                //     );
                // }
                //
                // await axios
                //     // .get(`${process.env.BACKEND_URL}/discord/hash?guild=${guild}&hash=${hashid}`)
                //     .get(`https://api.grepodata.com/discord/hash?guild=${guild}&hash=${hashid}`)
                //     .then((response) => {
                //         let data = response.data;
                //         if (data.success === true) {
                //             let embed = new MessageEmbed();
                //             // let imagename = response.data.url.split(/[/]+/).pop();
                //             let image = new MessageAttachment(response.data.url, 'report.png');
                //             // Logger.log(imagename);
                //             Logger.log(client.api.version)
                //             embed.setImage('attachment://report.png');
                //             embed.setThumbnail('attachment://report.png');
                //             // embed.setImage(response.data.url);
                //
                //             let name = 'User'
                //             if (interaction.member && interaction.member.user && interaction.member.user.username !== undefined) {
                //                 name = interaction.member.user.username
                //             }
                //             if (interaction.member && interaction.member.displayName !== undefined) {
                //                 name = interaction.member.displayName
                //             }
                //             embed
                //                 .setTitle(`**${name}** shared a report`)
                //                 .setColor(0x18bc9c)
                //                 .setDescription(
                //                     `Player: [${data.player_name}](${process.env.FRONTEND_URL}/intel/player/${data.world}/${data.player_id}) Town: [${data.town_name}](${process.env.FRONTEND_URL}/intel/town/${data.world}/${data.town_id})\nTown BB: \`[town]${data.town_id}[/town]\``
                //                 );
                //                 // .setImage(response.data.url);
                //                 // .setFooter(`Powered by the GrepoData userscript: grepodata.com/indexer`);
                //
                //             interactionReplyEmbedFile(client, interaction, embed, image);
                //         } else {
                //             interactionReply(
                //                 client,
                //                 interaction,
                //                 `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
                //             );
                //         }
                //     })
                //     .catch((err) => {
                //         Logger.log(err.message);
                //         interactionReply(
                //             client,
                //             interaction,
                //             `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
                //         );
                //     });

                break;
            case 'help':
            default:
                let output = `= Command List =\n\n GrepoData bot only responds to slash commands. Start typing '/' to see the options\n\n`;
                output += `/world       :: Set the default game world for this Discord guild\n`;
                output += `/today       :: Show today's player scoreboard\n`;
                output += `/yesterday   :: Show yesterday's player scoreboard\n`;
                output += `/alliance    :: Show alliance scoreboard\n`;
                output += `/search      :: Search for players by name\n`;
                output += `/gdreport    :: Allows you to share a report using the GrepoData indexer userscript\n`;

                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: '```asciidoc\n' + output + '```',
                            options: { code: 'asciidoc', split: { char: '\u200b' } }
                        }
                    }
                });
        }
    });
};

function interactionReplyEmbed(client, interaction, embed) {
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                embeds: [embed]
            }
        }
    });
}

function interactionReplyEmbedFile(client, interaction, embed, file) {
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                embeds: [embed],
                files: [file]
            }
        }
    });
}

function interactionReply(client, interaction, message) {
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: message
            }
        }
    });
}
