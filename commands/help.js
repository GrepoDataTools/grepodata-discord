exports.run = async (client, message) => {
    if (!message.content.length) {
        const commands = message.guild
            ? client.commands
            : client.commands.filter((command) => command.config.guildOnly !== true);
        const commandNames = commands.keyArray();
        const longest = commandNames.reduce((long, string) => Math.max(long, string.length), 0);

        let currentCategory = '';
        let output = `= Command List =\n\n [Use ${message.settings.prefix} help <command> for details]\n`;
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
                output += `${message.settings.prefix} ${command.settings.name}${' '.repeat(
                    longest - command.settings.name.length
                )} :: ${
                    command.settings.description ? `${command.settings.description}` : 'No description available'
                }\n`;
            }
        });

        return message.channel.send(output, { code: 'asciidoc', split: { char: '\u200b' } });
    }

    if (client.commands.has(message.content)) {
        let command = client.commands.get(message.content);
        return message.channel.send(
            `= ${command.settings.name} = \n${
                command.settings.description ? `${command.settings.description}` : 'No description available.'
            }\nusage:: ${
                command.settings.usage ? `${command.settings.usage}` : 'No usage available.'
            }\naliases:: ${command.config.aliases.join(', ')}\n= ${command.settings.name} =`,
            { code: 'asciidoc' }
        );
    }

    return message.channel.send(`Command ${message.content} does not exist.`);
};

exports.config = {
    aliases: ['h', 'halp']
};

exports.settings = {
    name: 'help',
    description: 'Displays all available commands.',
    permLevel: 'User',
    usage: 'help [command]',
    category: 'System'
};
