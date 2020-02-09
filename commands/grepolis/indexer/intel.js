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
            .catch((e) => console.log(e));
    } else {
        await axios
            .get(`${process.env.BACKEND_URL}/indexer/api/town?key=${message.guild.index}&name=${message.content}`)
            .then(async (response) => {
                const embed = await createEmbedForIndexedCity(response.data, message.guild.index);

                message.channel.send(embed);
            })
            .catch(() => message.channel.send(`Could not find indexed reports for this city.`));
    }
};

exports.config = {
    indexRequired: true,
    aliases: []
};

exports.settings = {
    name: 'intel',
    description: 'Shows available intel for a city',
    usage: 'intel [city bb code]',
    category: 'Indexer'
};
