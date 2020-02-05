const { Client, RichEmbed } = require('discord.js');
const logger = require('winston');
const request = require('request');
const parser  = require('discord-command-parser');
const client = new Client();

// const auth = require('./dev_auth.json');
const auth = require('./prod_auth.json');

// Configure parser
const prefix = '!';

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

client.on('ready', () => {
  client.user.setStatus("Listening to '!gd'");
  logger.info(`Logged in as ${client.user.tag}!`);
});

function escapeMarkdown(text) {
  let unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1'); // unescape any "backslashed" character
  return unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1'); // escape *, _, `, ~, \
}

client.on('message', message => {
  try {
    // Ignore other bots
    if(message.author.bot) return;

    // Check for raw town BBcode
    let isRawTown = false;
    if (/^\[town\].*\[\/town\]$/.test(message.content)) {
      isRawTown = true;
      message.content = '!gd intel '+message.content;
    }

    // Parse commands
    const parsed = parser.parse(message, prefix);
    if (!parsed.success || parsed.command !== 'gd') return;
    logger.info(parsed.arguments);
    if (parsed.arguments.length === 0) {
      parsed.arguments = ['help'];
    }

    // Handle args
    let guild_id = message.guild.id;
    let main_arg = parsed.arguments[0];
    switch (main_arg) {
      case 'intel':
      case 'userscript':
        request.get({url: auth.backend+'/discord/get_index?guild='+guild_id}, function (error, response, body) {
          if (response && response.statusCode && response.statusCode === 200) {
            let index = JSON.parse(response.body);
            let key = index.key;
            let userscript = 'https://api.grepodata.com/userscript/cityindexer_'+index.userscript+'.user.js';

            if (main_arg === 'userscript') {
              const embed = new RichEmbed()
                .setTitle('Contribute intelligence')
                .setColor(0x18BC9C)
                .setDescription('Help your alliance by contributing to enemy city index ['+key+'](https://grepodata.com/indexer/'+key+')!\n' +
                  '1. Download Tampermonkey for your browser\n' +
                  '2. [Install this userscript for index '+key+']('+userscript+')\n' +
                  '3. Reload your browser; you can now add in-game reports to the index')
              ;
              message.channel.send(embed);
            } else if (typeof parsed.arguments[1] !== "undefined") {
              let url = '';
              let town_input = '';
              if (!isNaN(parsed.arguments[1]) || /^\[town\].*\[\/town\]$/.test(parsed.arguments[1])) {
                // Search by town id
                town_input = parsed.arguments[1];
                let arg = parsed.arguments[1].replace(/[^0-9]/g, '');
                url = auth.backend + '/indexer/api/town?key=' + key + '&id=' + arg;
              } else {
                // Search by name
                town_input = parsed.arguments.slice(1).join(' ');
                url = auth.backend + '/indexer/api/town?key=' + key + '&name=' + town_input;
              }
              logger.info("Retrieving intel with url: " + url);
              request.get({url: url}, function (error, response, body) {
                if (response && response.statusCode && response.statusCode === 200) {
                  let intel = JSON.parse(response.body);
                  let town_url = 'https://grepodata.com/indexer/town/' + key + '/' + intel.world + '/' + intel.town_id;
                  const embed = new RichEmbed()
                    .setTitle('🏛️ Town intelligence: ' + intel.name)
                    .setURL(town_url)
                    .setColor(0x18BC9C)
                    .setDescription('Index: [' + key + '](https://grepodata.com/indexer/' + key + ') - ' +
                      'Player: [' + intel.player_name + '](https://grepodata.com/indexer/player/' + key + '/' + intel.world + '/' + intel.player_id + ') - ' +
                      'Alliance: [show alliance intel](https://grepodata.com/indexer/alliance/' + key + '/' + intel.world + '/' + intel.alliance_id + ')');
                  let troop_intel = '';
                  intel.intel.slice(0, 5).forEach(intelligence => {
                    let troops_txt = [];
                    intelligence.units.forEach(unit => {
                      troops_txt.push(unit.count + (unit.killed > 0 ? ' (-' + unit.killed + ') ' : ' ') + unit.name);
                    });
                    troop_intel += '`' + intelligence.date + '` - ' + troops_txt.join(', ') + '\n';
                  });
                  embed.addField('Troop intelligence [town]' + intel.town_id + '[/town]', troop_intel, false);
                  embed.addField('\u200B', '[See more](' + town_url + ')', false);
                  message.channel.send(embed);
                } else if (isRawTown === false) {
                  message.reply("Sorry, I found no intelligence for town '"+town_input+"' in index " + key);
                }
              });
            } else if (isRawTown === false) {
              const embed = new RichEmbed()
                .setTitle('🔑 Enemy city index: ' + key)
                .setURL('https://grepodata.com/indexer/'+key)
                .setColor(0x18BC9C)
                .setDescription('[Click here to go to your index](https://grepodata.com/indexer)\n' +
                  'Or use one of the following Discord commands:')
                // .addField('`!gd intel [town_name]`', 'Shows the intelligence for the given town name', true)
                .addField('`!gd intel [town_id]`', 'Shows the intelligence for the given town id', true)
              ;
              message.channel.send(embed);
            }
          } else if (isRawTown === false) {
            const embed = new RichEmbed()
              .setTitle('🔑 Enemey city indexer')
              .setURL('https://grepodata.com/indexer')
              .setColor(0x18BC9C)
              .setDescription('Please set a default index first: `!gd setIndex [index_key]`.\n' +
                'You can create a new index [here](https://grepodata.com/indexer).')
            ;
            message.channel.send(embed);
          }
        });
        break;
      case 'server':
      case 'setServer':
      case 'setserver':
      case 'set_server':
      case 'index':
      case 'setIndex':
      case 'setindex':
      case 'set_index':
        if (typeof parsed.arguments[1] === "undefined") {
          message.reply('Please enter a second argument: `!gd ' + main_arg + ' [value]`');
          break;
        } else {
          let arg1 = parsed.arguments[1];
          let type = 'server';
          if (main_arg === 'setServer' || main_arg === 'setserver' || main_arg === 'set_server' || main_arg === 'server') {
            opts = {url : auth.backend + '/discord/set_server?guild='+guild_id+'&server='+arg1};
          } else {
            type = 'index';
            if (arg1.length !== 8) {
              message.reply('Please enter a valid index key: !gd ' + main_arg + ' [index]');
              break;
            }
            opts = {url : auth.backend + '/discord/set_index?guild='+guild_id+'&index='+arg1};
          }
          request.get(opts, function (error, response, body) {
            if (response && response.statusCode && response.statusCode === 200) {
              message.reply('We have changed your default '+type+' to: ' + arg1);
            } else if (response && response.statusCode && response.statusCode === 404) {
              message.reply('Invalid argument: ' + arg1 + ' is not a valid ' + type);
            } else {
              message.reply('Oops, we can not do that right now. Try again later or with different arguments.');
            }
          });
        }
        break;
      case 'today':
      case 'now':
      case 'points':
      case 'score':
      case 'yesterday':
      case 'yday':
      case 'prev':
        // Player scoreboard
        if (main_arg === 'now' || main_arg === 'scoreboard' || main_arg === 'points' || main_arg === 'score') {
          main_arg = 'today';
        }
        let url = auth.backend + '/scoreboard/player';
        if (parsed.arguments[1]) {
          url += '?world='+parsed.arguments[1]+'&guild='+guild_id;
        } else {
          url += '?guild='+guild_id;
        }
        if (main_arg === 'yesterday' || main_arg === 'yday' || main_arg === 'prev') {
          url += '&yesterday=true';
        }
        url += '&minimal=true'; // dont render overview and con/los
        opts = {
          url : url
        };
        request.get(opts, function (error, response, body) {
          if (response && response.statusCode && response.statusCode === 200) {
            let scoreboard = JSON.parse(response.body);
            let boardUrl = 'https://grepodata.com/points/' + scoreboard.world;
            const embed = new RichEmbed()
              .setTitle('🏆 Daily scoreboard for ' + scoreboard.world)
              .setURL(boardUrl)
              .setColor(0x18BC9C)
              .setDescription('Showing player points gained on ' + scoreboard.date + (main_arg==='today'?' before '+scoreboard.time:' (**yesterday**)'));
            if (main_arg==='today') {
              embed.setFooter('next update: ' + scoreboard.nextUpdate);
            }
            let att_txt = '';
            scoreboard.att.slice(0, 10).forEach(function (player, i) {
              att_txt += '#' + (i + 1) + ' - ' + player.s + ' - ' + '[' + escapeMarkdown(player.n) + ']' + '(https://grepodata.com/player/' + scoreboard.world + '/' + player.i + ')' + '\n';
            });
            embed.addField('**⚔ Best attackers**', att_txt, true);
            let def_txt = '';
            scoreboard.def.slice(0, 10).forEach(function (player, i) {
              def_txt += '#' + (i + 1) + ' - ' + player.s + ' - ' + '[' + escapeMarkdown(player.n) + ']' + '(https://grepodata.com/player/' + scoreboard.world + '/' + player.i + ')' + '\n';
            });
            embed.addField('**🛡 Best defenders**', def_txt, true);
            embed.addField('\u200B', '[See more 📈](' + boardUrl + ')', false);
            message.channel.send(embed)
          } else {
            message.reply("Sorry, I can not do that right now.");
            logger.error('error:', error);
          }
        });
        break;
      case 'help':
      default:
        const embed = new RichEmbed()
          .setTitle('GrepoData commands:')
          .setURL('https://grepodata.com')
          .setColor(0x18BC9C)
          .setDescription('Use the following commands to interact with the GrepoData bot')
          .addField('`!gd today [server]`', 'Shows the scoreboard for the given server. E.g. `!gd today nl74` will show the scoreboard for nl74', false)
          .addField('`!gd setServer [server]`', 'Set the default server to [server]. E.g. `!gd setServer nl74` will change the default server to nl74', false)
          .addField('`!gd today`', 'Shows today\'s scoreboard for the default server', false)
          .addField('`!gd yesterday`', 'Shows yesterday\'s scoreboard for the default server', false)
          .addField('`!gd setIndex [index_key]`', 'Set the intelligence index key', false)
          .addField('`!gd intel [town_id]`', 'Shows the gathered town intel for [town_id]', false)
          .addField('`!gd intel [town_name]`', 'Shows the gathered town intel for [town_name]', false)
          .addField('`!gd intel`', 'Links to the default intelligence index', false)
          .addField('`!gd userscript`', 'Links to the default intelligence userscript', false)
        ;
        embed.addField('\u200B', '*If you have set a default index key, GrepoData Bot will respond to town BB code.*', false);
        embed.addField('\u200B', '***Disclaimer: GrepoData is an unofficial 3rd party site. Grepolis is a browser game by InnoGames GmbH.***', false);
        message.author.send(embed);
    }
  }
  catch(error) {
    logger.error('error:', error);
  }
});

client.login(auth.token);