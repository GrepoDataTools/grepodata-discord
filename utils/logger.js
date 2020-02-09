const moment = require('moment');
const chalk = require('chalk');

const Logger = module.exports = {
    debug: function (content) {
        return console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${chalk.green("[DEBUG]")} ${content}`)
    },
    log: function (content) {
        return console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${chalk.white("[LOG]")} ${content}`)
    },
    warn: function (content) {
        return console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${chalk.orange("[WARN]")} ${content}`)
    },
    error: function (content) {
        return console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${chalk.red("[ERROR]")} ${content}`)
    },
    ready: function (content) {
        return console.log(`[${moment().format('DD-MM-YYYY HH:mm:ss')}] ${chalk.bgGreen("[READY]")} ${content}`)
    }
}