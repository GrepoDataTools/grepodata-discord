const Database = require('better-sqlite3');

const database = (module.exports = {
    seed: function() {
        let db = new Database('grepodata.db');

        const init = `
            CREATE TABLE IF NOT EXISTS land_units (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                type TEXT,
                wood INTEGER,
                stone INTEGER,
                silver INTEGER,
                favor INTEGER,
                population INTEGER,
                attack_type TEXT,
                attack_value NUMBER,
                blunt_defense NUMBER,
                sharp_defense NUMBER,
                distance_defense NUMBER,
                loot NUMBER
            );
            
            CREATE TABLE IF NOT EXISTS naval_units (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                type TEXT,
                wood INTEGER,
                stone INTEGER,
                silver INTEGER,
                favor INTEGER,
                population INTEGER,
                attack_type TEXT,
                attack_value NUMBER,
                defense_value NUMBER,
                capacity NUMBER
            );
            `;

        db.exec(init);

        if (db.prepare('SELECT COUNT(*) FROM naval_units').all()[0]['COUNT(*)'] !== 8) {
            db.exec(
                `INSERT INTO naval_units (id, name, type, wood, stone, silver, favor, population, attack_type, attack_value, defense_value, capacity)
                 VALUES
                    (1, "transport boat", "transport", 500, 500, 400, 0, 7, "ship", 0, 0, 26),
                    (2, "bireme", "defense", 800, 700, 180, 0, 8, "ship", 24, 160, 0),
                    (3, "light ship", "attack", 1300, 300, 800, 0, 10, "ship", 200, 60, 0),
                    (4, "fire ship", "defense", 500, 750, 1500, 0, 8, "ship", 20, 1, 0),
                    (5, "fast transport ship", "transport", 800, 0, 400, 0, 5, "ship", 0, 0, 10),
                    (6, "trireme", "both", 2000, 1300, 1300, 0, 16, "ship", 250, 250, 15),
                    (7, "colony ship", "transport", 10000, 10000, 1000, 0, 170, "ship", 0, 0, 0),
                    (8, "hydra", "both", 6750, 3500, 4750, 300, 50, "ship", 1310, 1400, 0);
                `
            );
        }

        if (db.prepare('SELECT COUNT(*) FROM land_units').all()[0]['COUNT(*)'] !== 19) {
            db.exec(`
                INSERT INTO land_units (id, name, type, wood, stone, silver, favor, population, attack_type, attack_value,
                    blunt_defense, sharp_defense, distance_defense, loot)
                VALUES
                    (1, "militia", "defense", 0, 0, 0, 0, 0, "blunt", 2, 6, 8, 4, 0),
                    (2, "swordman", "defense", 95, 0, 85, 0, 1, "blunt", 5, 14, 8, 30, 16),
                    (3, "slinger", "attack", 55, 100, 40, 0, 1, "distance", 23, 7, 8, 2, 8),
                    (4, "archer", "defense", 120, 0, 75, 0, 1, "distance", 8, 7, 25, 13, 24),
                    (5, "hoplite", "both", 0, 75, 150, 0, 1, "sharp", 16, 18, 12, 7, 8),
                    (6, "horseman", "attack", 240, 120, 360, 0, 3, "blunt", 60, 18, 1, 24, 72),
                    (7, "chariot", "both", 200, 440, 320, 0, 4, "sharp", 56, 76, 16, 56, 64),
                    (8, "catapult", "attack", 700, 700, 700, 0, 15, "distance", 100, 30, 30, 30, 400),
                    (9, "minotaur", "both", 2500, 1050, 5450, 180, 30, "blunt", 650, 750, 330, 640, 480),
                    (10, "manticore", "attack", 5500, 3750, 4250, 270, 450, "sharp", 1010, 170, 225, 505, 360),
                    (11, "cyclop", "attack", 3000, 5000, 4000, 270, 450, "distance", 1035, 1050, 10, 1450, 320),
                    (12, "harpy", "attack", 2000, 500, 1700, 85, 14, "blunt", 295, 105, 70, 1, 340),
                    (13, "medusa", "attack", 1100, 2700, 1600, 110, 18, "sharp", 425, 480, 345, 290, 400),
                    (14, "pegasus", "defense", 4000, 1300, 700, 120, 20, "sharp", 100, 750, 275, 275, 160),
                    (15, "cerberus", "defense", 1950, 2350, 4700, 180, 30, "blunt", 210, 825, 300, 1575, 240),
                    (16, "erinys", "attack", 3300, 6600, 6600, 330, 55, "distance", 1700, 460, 460, 595, 440),
                    (17, "griffin", "attack", 4100, 2100, 5200, 230, 35, "blunt", 900, 320, 330, 100, 350),
                    (18, "calydonian boar", "defense", 2900, 1500, 1600, 120, 20, "sharp", 180, 700, 700, 100, 240),
                    (19, "divine envoy", "both", 0, 0, 0, 12, 3, "blunt", 45, 40, 40, 40, 5);
                `);
        }
    }
});
