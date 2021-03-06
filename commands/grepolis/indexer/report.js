const { get } = require('axios');
const { MessageEmbed } = require('discord.js');
const Logger = require('../../../utils/logger');
const { createErrorEmbed } = require('../../../utils/grepolis/statistics');

exports.run = async (client, message) => {
    if (message.content.length > 24 || !/^r?m?-?\d{2,24}$/.test(message.content)) {
        // Too long or contains invalid characters.. (hash must look like 'r1241241' or 'rm12312342')
        let embed = createErrorEmbed(
            `Sorry, **'${message.content}'** is not a valid report link`,
            `Tip: Install the GrepoData indexer userscript to share reports via Discord.\nRead more: [grepodata.com/indexer](https://grepodata.com/indexer)`
        );
        message.channel.send(embed);
    } else {
        get(`${process.env.BACKEND_URL}/discord/hash?guild=${message.guild.id}&hash=${message.content}`)
            .then((response) => {
                let data = response.data;
                if (data.success === true) {
                    let embed = new MessageEmbed();
                    embed.setImage(response.data.url);

                    embed
                        .setTitle(`**${message.member.displayName}** shared a report`)
                        .setColor(0x18bc9c)
                        .setDescription(
                            `Player: [${data.player_name}](${process.env.FRONTEND_URL}/intel/player/${data.world}/${data.player_id}) Town: [${data.town_name}](${process.env.FRONTEND_URL}/intel/town/${data.world}/${data.town_id})\nTown BB: \`[town]${data.town_id}[/town]\``
                        )
                        .setFooter(`Powered by the GrepoData userscript: grepodata.com/indexer`);

                    message.channel.send(embed);
                } else {
                    // message.channel.send('Sorry, I could not create an image for this report hash.');
                    let embed = createErrorEmbed(
                        '',
                        `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
                    );
                    message.channel.send(embed);
                }
            })
            .catch((err) => {
                Logger.log(err.message);
                let embed = createErrorEmbed(
                    '',
                    `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`
                );
                message.channel.send(embed);
            });
    }
};

exports.config = {
    aliases: []
};
exports.settings = {
    name: 'report',
    description:
        'Shows a screenshot of an indexed report. Share links can only be generated by the GrepoData userscript (grepodata.com/indexer)',
    permLevel: 'User',
    usage: 'report [hash]',
    category: 'Indexer',
    helpHidden: true
};
