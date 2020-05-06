/* global module */

const _ = require("underscore");
const Area = require("../area");
const map = require("../../../data/map/world_server");

class MusicAreas {
  constructor() {
    this.musicAreas = [];

    this.load();
  }

  load() {
    _.each(map.musicAreas, m => {
      const musicArea = new Area(m.id, m.x, m.y, m.width, m.height);

      this.musicAreas.push(musicArea);
    });

    log.info("Loaded " + this.musicAreas.length + " music areas.");
  }
}

module.exports = MusicAreas;
