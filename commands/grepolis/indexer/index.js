const { get } = require('axios');

exports.run = async (client, message) => {
    console.log(message.content);
    if (message.content.length !== 8)
        return message.reply('`Invalid index key. Please run command again with valid key.`');

    await get(`${process.env.BACKEND_URL}/discord/set_index?guild=${message.guild.id}&index=${message.content}`)
        .then(() => {
            message.reply(`\`Index for this guild was successfully set to ${message.content}\``);
        })
        .catch((error) => {
            const { data } = error.response;

            message.reply(`\`${data.message}\``);
        });
};

exports.config = {
    aliases: ['setindex', 'setIndex', 'set_index']
};
exports.settings = {
    name: 'index',
    description: 'Sets index for this guild.',
    category: 'Indexer',
    usage: 'index [index identificator]'
};
