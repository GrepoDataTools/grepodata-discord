module.exports = (client) => {
    client.permlevel = (message) => {
        let permlvl = 0;

        const permOrder = client.config.permLevels.slice(0).sort((p, c) => (p.level < c.level ? 1 : -1));

        while (permOrder.length) {
            const currentLevel = permOrder.shift();
            if (message.guild && currentLevel.guildOnly) continue;
            if (currentLevel.check(message)) {
                permlvl = currentLevel.level;
                break;
            }
        }
        return permlvl;
    };

    const defaultSettings = {
        prefix: '!gd',
        modLogChannel: 'mod-log',
        modRole: 'Moderator',
        adminRole: 'Administrator',
        systemNotice: 'true',
        welcomeChannel: 'welcome',
        welcomeMessage: 'Say hello to {{user}}, everyone!',
        welcomeEnabled: 'false'
    };

    client.getSettings = (guild) => {
        client.settings.ensure('default', defaultSettings);
        if (!guild) return client.settings.get('default');
        const guildConf = client.settings.get(guild.id) || {};
        // This "..." thing is the "Spread Operator". It's awesome!
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        return { ...client.settings.get('default'), ...guildConf };
    };

    client.awaitReply = async (msg, question, limit = 60000) => {
        const filter = (m) => m.author.id === msg.author.id;
        await msg.channel.send(question);
        try {
            const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ['time'] });
            return collected.first().content;
        } catch (e) {
            return false;
        }
    };

    client.clean = async (client, text) => {
        if (text && text.constructor.name === 'Promise') text = await text;
        if (typeof text !== 'string') text = require('util').inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(client.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');

        return text;
    };

    Object.defineProperty(String.prototype, 'toProperCase', {
        value: function() {
            return this.replace(
                /([^\W_]+[^\s-]*) */g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        }
    });

    Object.defineProperty(Array.prototype, 'random', {
        value: function() {
            return this[Math.floor(Math.random() * this.length)];
        }
    });
};
