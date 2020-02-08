const fs = require('fs');
const _ = require('lodash');
const Logger = require('./logger');
const recursive = require('recursive-readdir');

module.exports = async (client) => {
    const events = await recursive('./events');

    events.map((event) => {
        let name = _.split(event, '.', 2)[0];
        name = _.replace(name, 'events/', '');
        const eventFile = require(`../${event}`);

        client.on(name, eventFile.bind(null, client));
    })
}