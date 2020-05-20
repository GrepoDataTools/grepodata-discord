const Discord = require('discord.js');
const units = require('../../utils/grepolis/units');

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

    args.map((argument) => {
        const unitArgument = argument.match(/([0-9]+)([a-z]+)/);
        const unitNumber = unitArgument[1];
        const unitName = unitArgument[2];

        const unit = units.getUnit(unitName);

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

    message.channel.send({ embed });
};

exports.config = {
    aliases: []
};
exports.settings = {
    name: 'calculator',
    description: 'Calculate resources, attack value, defense value, population and many more things for troops.',
    permLevel: 'User',
    category: 'Grepolis',
    usage:
        'calculator {number of troops}{troop} -> 95archers 55griff 85char\n' +
        'eg. sword, slinger, archer, hoplite, horse, chariot, catapult, ...\n You can use all units that Grepolis has!'
};
