const { MessageEmbed } = require('discord.js');
const axios = require('axios');
const { createEmbedForIndexedCity } = require('../../../utils/grepolis/statistics');

exports.run = async (client, message) => {
    if (message.content.match(/\[town\][0-9]+\[\/town\]/)) {
        message.content = message.content.replace('[town]', '').replace('[/town]', '');
    }

    if (message.content.match(/^[0-9]+$/)) {
        await axios
            .get(`${process.env.BACKEND_URL}/indexer/api/town?key=${message.guild.index}&id=${message.content}`)
            .then((response) => {
                const embed = createEmbedForIndexedCity(response.data, message.guild.index);

                message.channel.send(embed);
            })
            .catch(() => message.channel.send(`Could not find indexed reports for this city.`));
    } else if (message.content.match(/^[a-zA-Z0-9]+$/)) {
        await axios
            .get(`${process.env.BACKEND_URL}/indexer/api/town?key=${message.guild.index}&name=${message.content}`)
            .then(async (response) => {
                const embed = await createEmbedForIndexedCity(response.data, message.guild.index);

                message.channel.send(embed);
            })
            .catch(() => message.channel.send(`Could not find indexed reports for this city.`));
    } else {
        const embed = new MessageEmbed().setTitle('Enemy City Index ' + message.guild.index).setColor(0x18bc9c)
            .setURL(`${process.env.FRONTEND_URL}/indexer/${message.guild.index}`)
            .setDescription(`You can view town intel with the discord bot by using the command: \`!gd intel TOWN_NAME\` or  \`!gd intel TOWN_BB_CODE\``);
        return message.channel.send(embed);
    }
};

exports.config = {
    indexRequired: true,
    aliases: []
};

exports.settings = {
    name: 'intel',
    description: 'Shows available intel for a city',
    permLevel: 'User',
    usage: 'intel [city bb code]',
    category: 'Indexer'
};
