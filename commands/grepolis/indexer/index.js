const { get } = require('axios');

exports.run = async (client, message) => {
    let indexKey = message.content;
    indexKey = indexKey.replace('[', '');
    indexKey = indexKey.replace(']', '');
    if (indexKey.length !== 8)
        return message.reply('`Invalid index key. Please run command again with valid key.`');

    await get(`${process.env.BACKEND_URL}/discord/set_index?guild=${message.guild.id}&index=${indexKey}`)
        .then(() => {
            message.reply(`\`Index for this guild was successfully set to ${indexKey}\``);
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
