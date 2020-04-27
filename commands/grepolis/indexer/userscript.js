const { get } = require('axios');
const { RichEmbed } = require('discord.js');

exports.run = async (client, message) => {
    const guildIndex = await get(`${process.env.BACKEND_URL}/discord/get_index?guild=${message.guild.id}`)
        .then((response) => response.data)
        .catch(() => false);

    if (guildIndex) {
        const { key, userscript } = guildIndex;

        const embed = new RichEmbed().setTitle('Contribute intelligence').setColor(0x18bc9c)
            .setDescription(`Help your alliance by contributing to enemy city index [${key}](https://grepodata.com/indexer/${key})!
                  1. Download Tampermonkey for your browser
                  2. [Install this userscript for index ${key}](${userscript})
                  3. Reload your browser; you can now add in-game reports to the index`);

        return message.channel.send(embed);
    }

    const embed = new RichEmbed().setTitle('Contribute intelligence').setColor(0x18bc9c)
        .setDescription(`Create your index and gather intel with your teammates!
                  1. Go to our [webpage](https://grepodata.com/indexer/) and create your index or view one.
                  2. Download Tampermonkey for your browser
                  3. Install the userscript for the index.
                  4. Reload your browser; you can now add in-game reports to the index`);

    return message.channel.send(embed);
};

exports.config = {
    aliases: ['script', 'indexer']
};
exports.settings = {
    name: 'userscript',
    description: 'Helps to set indexer',
    usage: 'userscript',
    category: 'Indexer'
};
