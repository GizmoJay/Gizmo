/* global module */

const _ = require("underscore");
    const Area = require("../area");
    const map = require("../../../data/map/world_server");

class ChestAreas {
    constructor (world) {
        const self = this;

        self.world = world;

        self.chestAreas = [];

        self.load();
    }

    load () {
        const self = this;

        _.each(map.chestAreas, (m) => {
            const chestArea = new Area(m.id, m.x, m.y, m.width, m.height);

            chestArea.maxEntities = m.entities || 0;
            chestArea.items = m.titems.split(",");
            chestArea.cX = parseInt(m.tx);
            chestArea.cY = parseInt(m.ty);

            if (m.tachievement) { chestArea.achievement = parseInt(m.tachievement); }

            self.chestAreas.push(chestArea);

            chestArea.onEmpty(() => {
                self.spawnChest(chestArea);
            });

            chestArea.onSpawn(() => {
                self.removeChest(chestArea);
            });
        });

        log.info("Loaded " + self.chestAreas.length + " chest areas.");
    }

    spawnChest (chestArea) {
        const self = this;

        if (new Date().getTime() - chestArea.lastSpawn < chestArea.spawnDelay) { return; }

        chestArea.chest = self.world.spawnChest(chestArea.items, chestArea.cX, chestArea.cY, false);
        chestArea.lastSpawn = new Date().getTime();
    }

    removeChest (chestArea) {
        const self = this;

        if (!chestArea.chest) { return; }

        self.world.removeChest(chestArea.chest);

        chestArea.chest = null;
    }
}

module.exports = ChestAreas;
