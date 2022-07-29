const Logger = require('../utils/logger');
const _ = require('lodash');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const { get } = require('axios');
const { createErrorEmbed } = require('../utils/grepolis/statistics');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const settings = (message.settings = client.getSettings(message.guild));

    if (message.content.startsWith('/gd')) {
        const embed2 = new MessageEmbed();
        embed2
            .setTitle('⚠ Incorrect command usage')
            // .setURL(`https://grepodata.com/discord`)
            .setColor(0xff9800)
            .setDescription(
                "Use the Discord command interface to use slash commands. **'/gd' is not the correct usage**"
            )
            .addField('\u200B', "Start typing '/' to trigger the command interface.", false)
            .addField(
                '\u200B',
                "**If you don't see any GrepoData commands there, you have to reinstall the bot with the correct permissions by clicking on the link below.**",
                false
            )
            .addField(
                '\u200B',
                '[Click here to reinstall the bot with the correct permissions](https://discord.com/api/oauth2/authorize?client_id=652263344429858872&permissions=2147502080&scope=applications.commands%20bot)',
                false
            )
            .setImage('https://api.grepodata.com/tmpimgdiscord.png');
        message.channel.send(embed2);

        return;
    }

    if (message.content.indexOf(settings.prefix) !== 0) return;

    // if (message.content === '!gd usercount') {
    //     message.reply(
    //         `GrepoData Bot is serving ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users in ${
    //             client.guilds.cache.size
    //         } guilds.`
    //     );
    //     return;
    //
    //     // // get guild collection size from all the shards
    //     // const req = await client.shard.fetchClientValues("guilds.cache.size");
    //     // const guild_count = req.reduce((p, n) => p + n, 0);
    //     //
    //     // message.reply(
    //     //     `GrepoData Bot is serving ${guild_count} users in ${guild_count} guilds.`
    //     // );
    //     // return;
    //
    // } else if (message.content.startsWith('!gd report ')) {
    if (message.content.startsWith('!gd report ')) {
        let hashval = message.content.replace('!gd report ', '');
        get(`${process.env.BACKEND_URL}/discord/hash?guild=${message.guild.id}&hash=${hashval}`)
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
    } else {
        const embed2 = new MessageEmbed();
        embed2
            .setTitle("⚠ '!gd' commands are replaced by slash commands")
            // .setURL(`https://grepodata.com/discord`)
            .setColor(0xff9800)
            .setDescription(
                "As of April 30 2022, GrepoData bot will no longer be able to respond to commands prefixed with '!gd' due to a change in Discord policy. " +
                    'Please start using our slash commands instead.'
            )
            // .addField('As of April 30 2022, GrepoData bot will no longer respond to commands prefixed with \'!gd\'.', '', false)
            .addField('\u200B', "Start typing '/' to trigger the command interface.", false)
            .addField(
                '\u200B',
                "**If you don't see any GrepoData commands there, you have to reinstall the bot with the correct permissions by clicking on the link below.**",
                false
            )
            .addField(
                '\u200B',
                '[Click here to reinstall the bot with the correct permissions](https://discord.com/api/oauth2/authorize?client_id=652263344429858872&permissions=2147502080&scope=applications.commands%20bot)',
                false
            )
            .addField('\u200B', `[More info](https://grepodata.com/discord)`, false)
            .setThumbnail('https://api.grepodata.com/tmpimgdiscord.png');
        message.channel.send(embed2);
    }
};
