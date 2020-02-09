const { get } = require('axios');

exports.run = async (client, message) => {
    get(`${process.env.BACKEND_URL}/discord/hash?guild=${message.guild.id}&hash=${message.content}`)
        .then((response) => message.channel.send(response.data.url))
        .catch(() => message.channel.send('Could not get image for this report hash.'));
};

exports.config = {
    aliases: []
};
exports.settings = {
    name: 'report',
    description: 'Shows screenshot for indexed report',
    usage: 'report [hash]',
    category: 'Indexer'
};
