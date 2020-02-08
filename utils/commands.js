const fs = require('fs');
const _ = require('lodash');
const Logger = require('./logger');
const recursive = require('recursive-readdir');

module.exports = async (client, commandsRelativePath) => {
    loadCommand: function loadCommand(commandName) {
        try {
            const command = require(`../${commandName}`);

            client.commands.set(command.settings.name, command);

            command.config.aliases.map(alias => client.aliases.set(alias, command.settings.name));

            Logger.log(`Command ${_.split(command.settings.name, '.', 1)} loaded.`)
        } catch (error) {
            Logger.error(`Unable to load command ${_.split(commandName, '.', 1)}: ${error}!`)
        }
    }

    if (!fs.existsSync(commandsRelativePath)) {
        Logger.error(`Error occured while loading commands. Commands path ${commandsRelativePath} does not exist.`)
    }

    const commandFiles = await recursive(commandsRelativePath);

    commandFiles.map((file) => {
        if (!file.endsWith('.js')) return;

        loadCommand(file)
    })
}