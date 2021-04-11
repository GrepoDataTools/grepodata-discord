const Logger = require('../utils/logger');
const _ = require('lodash');
const axios = require('axios');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const settings = (message.settings = client.getSettings(message.guild));

    if (message.content.indexOf(settings.prefix) !== 0) return;

    if (message.content === '!gd usercount') {
        message.reply(
            `GrepoData Bot is serving ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users in ${
                client.guilds.cache.size
            } guilds.`
        );
        return;
    }

    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(mention)) return message.reply(`Prefix for this guild is \`${settings.prefix}\``);

    const args = message.content
        .slice(settings.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift();

    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if (!cmd) {
        message.reply(`Command not found. Run \`${settings.prefix} help\` to get all commands.`);
        return;
    }

    if (cmd && !message.guild && cmd.config.guildOnly)
        return message.channel.send(
            'This command is unavailable via private message. Please run this command in a guild.'
        );

    Logger.log(
        `[COMMAND] ${message.author.username}(${message.author.id}, guild ${message.guild.id}) ran command ${cmd.settings.name}`
    );

    // if (cmd.config.serverRequired) {
    //     let t =2;
    //     indexExists = await axios
    //         .get(`${process.env.BACKEND_URL}/discord/guild_settings?guild=${message.guild.id}`)
    //         .then((response) => {
    //             if (!response.data.server || response.data.server == null) {
    //                 message.reply(
    //                     `To use this command you must first choose a world for your guild by running \`!gd server [WORLD]\``
    //                 );
    //                 return false;
    //             } else {
    //                 message.guild.server = response.data.server;
    //                 return true;
    //             }
    //         })
    //         .catch(() => {
    //             message.reply(
    //                 `To use this command you must first choose a world for your guild by running \`!gd server [WORLD]\``
    //             );
    //             return false;
    //         });
    //
    //     if (!indexExists) return;
    // }

    const level = client.permlevel(message);

    if (level < client.levelCache[cmd.settings.permLevel]) {
        if (settings.systemNotice === 'true') {
            return message.channel.send(`You do not have permission to use this command.
  Your permission level is ${level} (${client.config.permLevels.find((l) => l.level === level).name})
  This command requires level ${client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
        } else {
            return;
        }
    }

    message.author.permLevel = level;

    message.content = _.replace(message.content, `${settings.prefix} ${command}`, '');
    message.content = _.trimStart(message.content);

    cmd.run(client, message, args, command, level);
};
