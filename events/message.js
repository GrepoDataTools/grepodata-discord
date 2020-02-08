const Logger = require('../utils/logger');

module.exports = async (client, message) => {
    if (message.author.bot) return

    const settings = message.settings = client.getSettings(message.guild);

    if (message.content.indexOf(settings.prefix) !== 0) return;

    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);

    if (message.content.match(mention)) return message.reply(`Profix for this guild is \`${settings.prefix}\``);

    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if (!cmd) {message.reply(`Command not found. Run \`${settings.prefix} help\` to get all commands.`); return;}

    if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

    Logger.log(`[COMMAND] ${message.author.username}(${message.author.id}) ran command ${cmd.settings.name}`)

    cmd.run(client, message, args);
}