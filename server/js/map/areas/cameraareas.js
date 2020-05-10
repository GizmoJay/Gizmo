/* global module */

const _ = require("underscore");
const Area = require("../area");
const map = require("../../../data/map/world_server");

class CameraAreas {
  constructor() {
    this.cameraAreas = [];

    this.load();
  }

  load() {
    const list = map.cameraAreas;

    _.each(list, o => {
      const cameraArea = new Area(o.id, o.x, o.y, o.width, o.height);

      cameraArea.type = o.type;

      this.cameraAreas.push(cameraArea);
    });

    log.info("Loaded " + this.cameraAreas.length + " camera areas.");
  }
}

module.exports = CameraAreas;
