const { get } = require('axios');
const { MessageEmbed } = require('discord.js');
const Logger = require('../../../utils/logger');

exports.run = async (client, message) => {
    if (message.content.length > 24 || !/^r?m?-?\d{2,24}$/.test(message.content)) {
        // Too long or contains invalid characters.. (hash must look like 'r1241241' or 'rm12312342')
        message.channel.send(
            `${message.content} is not a valid report hash. You should to install the GrepoData indexer userscript and use the code it gives you to share reports on Discord (https://grepodata.com/indexer).`
        );
    } else {
        get(`${process.env.BACKEND_URL}/discord/hash?guild=${message.guild.id}&hash=${message.content}`)
            .then((response) => {
                let data = response.data;
                if (data.success === true) {
                    let embed = new MessageEmbed();
                    embed.setImage(response.data.url);
                    if (data.intel) {
                        embed
                            .setTitle(`🏛️ Enemy town: ${data.intel.town_name}`)
                            .setURL(
                                `${process.env.FRONTEND_URL}/indexer/town/${data.index}/${data.world}/${data.intel.town_id}`
                            )
                            .setColor(0x18bc9c)
                            .setDescription(
                                `Index: [${data.index}](${process.env.FRONTEND_URL}/indexer/${data.index}) Player: [${data.intel.player_name}](${process.env.FRONTEND_URL}/indexer/player/${data.index}/${data.world}/${data.intel.player_id}) BB: \`[town]${data.intel.town_id}[/town]\``
                            );
                    } else if (!data.index) {
                        embed.addField(
                            'Hint: link your index to this Discord server',
                            `use \`!gd index [your_index_key]\` to link your city index`,
                            false
                        );
                    }
                    message.channel.send(embed);
                } else if (data.success === false && data.error_code) {
                    let response_message = '';
                    switch (data.error_code) {
                        case 5001:
                            response_message = `You need to set a default index before you can share reports (\`!gd index [your_index_key]\`).`;
                            break;
                        case 5003:
                            response_message = `This report has not yet been indexed. You can only share indexed reports.`;
                            break;
                        case 5004:
                            response_message = `Sorry, we can not generate an image for this report. Try a different report or contact us if this error persists.`;
                            break;
                        default:
                            response_message = 'Sorry, I could not create an image for this report hash.';
                    }
                    message.channel.send(response_message);
                } else {
                    message.channel.send('Sorry, I could not create an image for this report hash.');
                }
            })
            .catch((err) => {
                Logger.log(err.message);
                message.channel.send('Sorry, I could not create an image for this report hash, try again later.');
            });
    }
};

exports.config = {
    aliases: []
};
exports.settings = {
    name: 'report',
    description: 'Shows screenshot for indexed report',
    permLevel: 'User',
    usage: 'report [hash]',
    category: 'Indexer',
    helpHidden: true
};
