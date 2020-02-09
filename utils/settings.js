module.exports = (client) => {
    const { settings } = client;

    const defaultSettings = {
        "prefix": "!gd",
        "modLogChannel": "mod-log",
        "modRole": "Moderator",
        "adminRole": "Administrator",
        "systemNotice": "true",
        "welcomeChannel": "welcome",
        "welcomeMessage": "{{user}} just joined!",
        "welcomeEnabled": "false"
    };

    client.getSettings = (guild) => {
        settings.ensure("default", defaultSettings);

        if(!guild) return settings.get("default");

        const guildConfig = settings.get(guild.id) || {};

        return ({ ...settings.get("default"), ...guildConfig});
    }
}