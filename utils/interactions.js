const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const Logger = require('./logger');
const { createEmbedForStatistics } = require('./grepolis/statistics');

module.exports = async (client) => {
    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        Logger.log(
            `[INTERACTION] ${interaction.member.user.username}(${interaction.member.user.id}, guild ${interaction.guild_id}) ran interaction ${interaction.data.name}`
        );

        let guild = interaction.guild_id;
        let command = interaction.data.name;

        let world = null;
        let yesterday_opt = false;
        if ('options' in interaction.data) {
            interaction.data.options.map((option) => {
                switch (option.name) {
                    case 'world':
                        world = option.value;
                        break;
                    case 'day':
                        yesterday_opt = option.value === 'yesterday';
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
            case 'help':
            default:
                // list commands
                const commands = interaction.guild_id
                    ? client.commands
                    : client.commands.filter((command) => command.config.guildOnly !== true);
                const commandNames = commands.keyArray();
                const longest = commandNames.reduce((long, string) => Math.max(long, string.length), 0);

                let currentCategory = '';
                let output = `= Command List =\n\n You can also use slash commands. Start typing '/' to see the options\n [Use '!gd help <command>' for details]\n`;
                const sortedCommands = commands
                    .array()
                    .sort((c, p) =>
                        p.settings.category > c.settings.category
                            ? 1
                            : p.settings.name > c.settings.name && p.settings.category === c.settings.category
                            ? 1
                            : -1
                    );

                sortedCommands.forEach((command) => {
                    let cat;

                    if (command.settings.category) {
                        cat = command.settings.category.toProperCase();
                    } else {
                        cat = 'Misc';
                    }

                    if (currentCategory !== cat) {
                        output += `\u200b\n== ${cat} ==\n`;
                        currentCategory = cat;
                    }

                    if (!command.settings.helpHidden || command.settings.helpHidden === false) {
                        output += `!gd ${command.settings.name}${' '.repeat(
                            longest - command.settings.name.length
                        )} :: ${
                            command.settings.description
                                ? `${command.settings.description}`
                                : 'No description available'
                        }\n`;
                    }
                });

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
