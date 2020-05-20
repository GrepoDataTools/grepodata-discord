const Database = require('better-sqlite3');

const getUnit = (name) => {
    const db = new Database('grepodata.db');
    let unit;

    unit = db.prepare(`SELECT * FROM land_units WHERE name LIKE ?`);

    if (!unit.get(`%${name}%`)) {
        unit = db.prepare(`SELECT * FROM naval_units WHERE name LIKE ?`);
    }

    return unit.get(`${name.charAt(0)}%${name.charAt(1)}%${name.length > 1 ? `${name.slice(2)}%` : ''}`);
};

module.exports = {
    getUnit
};
