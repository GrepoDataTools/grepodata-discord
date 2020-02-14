const { RichEmbed } = require('discord.js');
const { CanvasRenderService } = require('chartjs-node-canvas');
const { Attachment } = require('discord.js');

const createEmbedForStatistics = (statistics, is_today) => {
    let attackers = '',
        defenders = '';

    const embed = new RichEmbed();

    statistics.att.slice(0, 10).map((stat, index) => {
        let place = index + 1;

        if (place === 1) stat.emoji = ':first_place:';
        if (place === 2) stat.emoji = ':second_place:';
        if (place === 3) stat.emoji = ':third_place:';

        attackers += `${stat.emoji ? stat.emoji : `#${place}.`} [${stat.n}](https://grepodata.com/player/${
            statistics.world
        }/${stat.i}) - ${stat.s}\n`;
    });

    statistics.def.slice(0, 10).map((stat, index) => {
        let place = index + 1;

        if (place === 1) stat.emoji = ':first_place:';
        if (place === 2) stat.emoji = ':second_place:';
        if (place === 3) stat.emoji = ':third_place:';

        defenders += `${stat.emoji ? stat.emoji : `#${place}.`} [${stat.n}](https://grepodata.com/player/${
            statistics.world
        }/${stat.i}) - ${stat.s}\n`;
    });

    embed
        .setTitle('🏆 Daily scoreboard for ' + statistics.world)
        .setURL(`https://grepodata.com/points/${statistics.world}`)
        .setColor(0x18bc9c)
        .setDescription(`Showing player points gained on ${statistics.date} ` + (is_today?`before ${statistics.time}`:'(**yesterday**)'))
        .addField('**⚔ Best attackers**', attackers, true)
        .addField('**🛡 Best defenders**', defenders, true)
        .addField('\u200B', `[See more 📈](https://grepodata.com/points/${statistics.world})`, false);
    if (is_today) {
        embed.setFooter(`next update: ${statistics.nextUpdate}`);
    }

    return embed;
};

const createEmbedForIndexedCity = (statistics, index) => {
    let intel = '';
    const embed = new RichEmbed();

    statistics.intel.slice(0, 10).map((stat) => {
        let units = '';

        stat.units.map((unit) => (units += `${unit.count}${!!unit.killed ? `(-${unit.killed})` : ''} ${unit.name} `));

        intel = intel + `\`${stat.date}\` ${units}\n`;
    });

    embed
        .setTitle(`🏛️ Town intelligence: ${statistics.name}`)
        .setURL(`https://grepodata.com/indexer/town/${index}/${statistics.world}/${statistics.town_id}`)
        .setColor(0x18bc9c)
        .setDescription(
            `Index: [${index}](https://grepodata.com/indexer/${index}) Player: [${
                statistics.player_name
            }](https://grepodata.com/indexer/player/${index}/${statistics.world}/${
                statistics.player_id
            }) ${statistics.alliance_id &&
                `Alliance: [show alliance intel](https://grepodata.com/indexer/alliance/${index}/${statistics.world}/${statistics.alliance_id})`}`
        )
        .addField(`Troop intelligence [town]${statistics.town_id}[/town]`, intel, false)
        .addField(
            '\u200B',
            `[See more](https://grepodata.com/indexer/town/${index}/${statistics.world}/${statistics.town_id})`,
            false
        );

    return embed;
};

const createHeatmapChartForPlayer = async (statistics) => {
    let heatmapData = [];
    for (i = 0; i <= 24; i++) {
        statistics.heatmap.hour[`${i}`] ? heatmapData.push(statistics.heatmap.hour[`${i}`]) : heatmapData.push(0);
    }

    const canvasRenderService = new CanvasRenderService(900, 700);
    const image = await canvasRenderService.renderToBuffer({
        type: 'bar',
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            datasets: [
                {
                    data: heatmapData,
                    backgroundColor: '#009688'
                }
            ]
        },
        options: {
            backgroundColor: '#f8f8f8',
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            fontColor: '#009688',
                            fontSize: 22,
                            labelString: 'Hour of day'
                        },
                        ticks: {
                            fontColor: '#009688',
                            fontSize: 15
                        }
                    }
                ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            fontColor: '#009688',
                            fontSize: 22,
                            labelString: 'Relative activity'
                        },
                        ticks: {
                            display: false,
                        }
                    }
                ]
            },
            legend: {
                display: false
            }
        }
    });

    return {
        player: statistics.name,
        image: new Attachment(image, 'heatmap.jpg')
    };
};

module.exports = {
    createEmbedForStatistics,
    createEmbedForIndexedCity,
    createHeatmapChartForPlayer
};
