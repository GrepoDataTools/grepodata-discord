const Logger = require('../utils/logger');
const _ = require('lodash');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const { get } = require('axios');
const { createErrorEmbed } = require('../utils/grepolis/statistics');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const settings = (message.settings = client.getSettings(message.guild));

    if (message.content.indexOf(settings.prefix) !== 0) return;

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
};
