const { get } = require('axios');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message) => {
    const embed = new MessageEmbed().setTitle('Getting started: GrepoData City Indexer').setColor(0x18bc9c)
        .setDescription(`Get started using the GrepoData City Indexer:
                  1. [Create a GrepoData account](https://grepodata.com/indexer/) to collect and share enemy intelligence.
                  2. Download Tampermonkey for your browser
                  3. Install the [GrepoData Userscript](https://api.grepodata.com/script/indexer.user.js)
                  4. Reload your browser; you can now add in-game reports to your account
                  5. Create or join an index to share the collected intel with your allies
                  `);

    return message.channel.send(embed);
};

exports.config = {
    aliases: ['script', 'indexer', 'userscript', 'index', 'intel']
};
exports.settings = {
    name: 'indexer',
    description: 'Get started using the GrepoData City Indexer',
    permLevel: 'User',
    usage: 'indexer',
    category: 'Indexer'
};
