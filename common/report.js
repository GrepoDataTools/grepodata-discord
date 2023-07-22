const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const Logger = require('../utils/logger');

async function handleReportCommand(interaction) {
    try {
        let guild = interaction.guild.id;
        let command = interaction.commandName;

        // Parse options
        let hash = interaction.options.getString('hash');
        let hashid = hash.replace('hash: ', '').replace('/report ', '');

        if (hashid.length > 24 || !/^r?m?-?\d{2,24}$/.test(hashid)) {
            interaction.reply(
                `Sorry, **'${hashid}'** is not a valid report link.\n` +
                `Tip: Install the GrepoData indexer userscript to share reports via Discord.\nRead more: [grepodata.com/indexer](https://grepodata.com/indexer)`
            );
        }

        await axios
            // .get(`${process.env.BACKEND_URL}/discord/hash?guild=${guild}&hash=${hashid}`)
            .get(`https://api.grepodata.com/discord/hash?guild=${guild}&hash=${hashid}`)
            .then((response) => {
                let data = response.data;
                if (data.success === true) {
                    let embed = new EmbedBuilder();

                    // let imagename = response.data.url.split(/[/]+/).pop();
                    // let image = new AttachmentBuilder(response.data.url, 'report.png');
                    // Logger.log(response.data.url);
                    // Logger.log(image.name);
                    // embed.setImage('attachment://report.png');
                    // embed.setThumbnail('attachment://report.png');

                    embed.setImage(response.data.url);

                    let name = 'User'
                    if (interaction.member && interaction.member.user && interaction.member.user.username !== undefined) {
                        name = interaction.member.user.username
                    }
                    if (interaction.member && interaction.member.displayName !== undefined) {
                        name = interaction.member.displayName
                    }
                    embed
                        .setTitle(`**${name}** shared a report`)
                        .setColor(0x18bc9c)
                        .setFooter({text: `Powered by the GrepoData userscript: grepodata.com/indexer`});

                    if ('town_id' in data && data.town_id) {
                        embed.setDescription(
                            `Player: [${data.player_name}](${process.env.FRONTEND_URL}/intel/player/${data.world}/${data.player_id}) Town: [${data.town_name}](${process.env.FRONTEND_URL}/intel/town/${data.world}/${data.town_id})\nTown BB: \`[town]${data.town_id}[/town]\``
                        )
                    }

                    interaction.reply({embeds: [embed]});
                    // interaction.reply({embeds: [embed], files: [image]});
                } else {
                    interaction.reply(
                        `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
                    );
                }
            })
            .catch((error) => {
                Logger.error(error.stack);
                interaction.reply(
                    `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
                );
            });
    } catch (error) {
        Logger.error(error.stack);
        interaction.reply(
            `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
        );
    }
}

module.exports = {
    handleReportCommand
};
