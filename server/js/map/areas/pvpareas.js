/* global module */

const _ = require("underscore");
const Area = require("../area");
const map = require("../../../data/map/world_server");

class PVPAreas {
  constructor() {
    this.pvpAreas = [];

    this.load();
  }

  load() {
    const list = map.pvpAreas;

    _.each(list, p => {
      const pvpArea = new Area(p.id, p.x, p.y, p.width, p.height);

      this.pvpAreas.push(pvpArea);
    });

    log.info("Loaded " + this.pvpAreas.length + " PVP areas.");
  }
}

module.exports = PVPAreas;
