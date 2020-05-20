exports.run = async (client, message, args, command, level) => {
    const friendly = client.config.permLevels.find((permLevel) => permLevel.level === level).name;

    message.channel.send(`Your permission level is ${level} - ${friendly}`);
};

exports.config = {
    aliases: ['level', 'mylevel']
};
exports.settings = {
    name: 'mylevel',
    description: 'Shows your level.',
    permLevel: 'User',
    category: 'System',
    usage: 'mylevel'
};
