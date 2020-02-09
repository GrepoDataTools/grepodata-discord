const Logger = require('../utils/logger');
const _ = require('lodash');
const axios = require('axios');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const settings = (message.settings = client.getSettings(message.guild));

    if (message.content.indexOf(settings.prefix) !== 0) return;

    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);

    if (message.content.match(mention)) return message.reply(`Profix for this guild is \`${settings.prefix}\``);

    const args = message.content
        .slice(settings.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();

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

    Logger.log(`[COMMAND] ${message.author.username}(${message.author.id}) ran command ${cmd.settings.name}`);

    if (cmd.config.indexRequired) {
        indexExists = await axios
            .get(`${process.env.BACKEND_URL}/discord/get_index?guild=${message.guild.id}`)
            .then((response) => {
                message.guild.index = response.data.key;
                return true;
            })
            .catch(() => {
                message.reply(`To use this command please set guild\'s index by running ${settings.prefix} index`);
                return false;
            });

        if (!indexExists) return;
    }

    if (cmd.config.serverRequired) {
        indexExists = await axios
            .get(`${process.env.BACKEND_URL}/discord/guild_settings?guild=${message.guild.id}`)
            .then((response) => {
                message.guild.server = response.data.server;
                return true;
            })
            .catch(() => {
                message.reply(`To use this command please set guild\'s server by running ${settings.prefix} server`);
                return false;
            });

        if (!indexExists) return;
    }

    message.content = _.replace(message.content, `${settings.prefix} ${command}`, '');
    message.content = _.trimStart(message.content);

    cmd.run(client, message, args, command);
};
