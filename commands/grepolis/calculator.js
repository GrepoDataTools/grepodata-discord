const Discord = require('discord.js');
const units = require('../../utils/grepolis/units');
const Logger = require('../../utils/logger');

exports.run = async (client, message, args, command, level) => {
    let attackValues = {
        blunt: 0,
        sharp: 0,
        distance: 0,
        ship: 0
    };
    let defenseValues = {
        blunt: 0,
        sharp: 0,
        distance: 0,
        ship: 0
    };
    let transport = {
        capacity: 0
    };
    let resources = {
        wood: 0,
        stone: 0,
        silver: 0,
        favor: 0,
        population: 0
    };

    let parsedUnits = [];
    args.map((argument) => {
        const unitArgument = argument.match(/([0-9]+)([a-z]+)/);
        if (!unitArgument) {
            return message.channel.send(
                `Sorry, **${argument}** is not a valid calculator argument. use command \`!gd help calculator\` for an example of how to use this command.`
            );
        }

        const unitNumber = unitArgument[1];
        const unitName = unitArgument[2];

        const unit = units.getUnit(unitName);
        if (!unit) {
            return message.channel.send(
                `Sorry, **${unitName}** is not a valid unit name. use command \`!gd help calculator\` for a list of unit names.`
            );
        }
        parsedUnits.push(unitNumber + ' ' + unit.name);

        attackValues[unit.attack_type] = attackValues[unit.attack_type] + unit.attack_value * unitNumber;

        if (unit.type === 'transport') transport.capacity = transport.capacity + unit.capacity * unitNumber;

        if (unit.attack_type === 'ship') {
            defenseValues.ship = defenseValues.ship + unit.defense_value * unitNumber;
        } else {
            defenseValues.blunt = defenseValues.blunt + unit.blunt_defense * unitNumber;
            defenseValues.sharp = defenseValues.sharp + unit.sharp_defense * unitNumber;
            defenseValues.distance = defenseValues.distance + unit.distance_defense * unitNumber;
        }

        resources.wood = resources.wood + unit.wood * unitNumber;
        resources.stone = resources.stone + unit.stone * unitNumber;
        resources.silver = resources.silver + unit.silver * unitNumber;
        resources.favor = resources.favor + unit.favor * unitNumber;
        resources.population = resources.population + unit.population * unitNumber;
    });

    const embed = new Discord.MessageEmbed()
        .setColor(0x18bc9c)
        .setTitle('Troop calculator')
        .setDescription('Parsed units: ' + parsedUnits.join(', '))
        .setThumbnail('https://grepodata.com/assets/images/favicon_lg_white.png')
        .addFields(
            {
                name: ':evergreen_tree: Wood',
                value: `${resources.wood.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':mountain: Stone',
                value: `${resources.stone.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':cd: Silver',
                value: `${resources.silver.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            }
        )
        .addField('\u200B', '\u200B')
        .addFields(
            {
                name: ':crossed_swords: Blunt attack',
                value: `${attackValues.blunt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':crossed_swords: Sharp attack',
                value: `${attackValues.sharp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':crossed_swords: Distance attack',
                value: `${attackValues.distance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            }
        )
        .addFields(
            {
                name: ':shield: Blunt defense',
                value: `${defenseValues.blunt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':shield: Sharp defense',
                value: `${defenseValues.sharp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':shield: Distance defense',
                value: `${defenseValues.distance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            }
        )
        .addField('\u200B', '\u200B')
        .addFields(
            {
                name: ':crossed_swords: Ship attack',
                value: `${attackValues.ship.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':shield: Ship defense',
                value: `${defenseValues.ship.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            }
        )
        .addFields(
            {
                name: ':canoe: Transport capacity',
                value: `${transport.capacity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            },
            {
                name: ':people_holding_hands: Population used',
                value: `${resources.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
                inline: true
            }
        );

    if (parsedUnits.length > 0) {
        message.channel.send({ embed });
    }
};

exports.config = {
    aliases: ['calc', 'calculate']
};
exports.settings = {
    name: 'calculator',
    description: 'Calculate resources, attack value, defense value, population and many more things for troops.',
    permLevel: 'User',
    category: 'Grepolis',
    usage:
    'calculator {number of troops}{troop} -> !gd calculator 95archer 55griff 85char\n' +
    'List of units: swordman, slinger, archer, hoplite, horseman, chariot, catapult, minotaur, manticore, cyclop, harpy, medusa, pegasus, cerberus, erinys, griffin, boar, envoy, transport, bireme, lightship, fireship, fasttransport, trireme, colonyship, hydra\n'
};
