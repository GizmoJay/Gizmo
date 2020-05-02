/* global module */

const _ = require("underscore");
const Grids = require("./grids");
const Regions = require("./regions");
const Utils = require("../util/utils");
const Modules = require("../util/modules");
const PVPAreas = require("./areas/pvpareas");
const MusicAreas = require("./areas/musicareas");
const ChestAreas = require("./areas/chestareas");
const map = require("../../data/map/world_server");
const Spawns = require("../../data/spawns");
const OverlayAreas = require("./areas/overlayareas");
const CameraAreas = require("./areas/cameraareas");
const Mobs = require("../util/mobs");
const ClientMap = require("../../data/map/world_client");

class Map {
  constructor(world) {
    const self = this;

    self.world = world;

    self.ready = false;

    self.load();

    self.regions = new Regions(self);
    self.grids = new Grids(self);
  }

  load() {
    const self = this;

    self.version = map.version || 0;

    self.clientMap = ClientMap;

    self.width = map.width;
    self.height = map.height;
    self.collisions = map.collisions;
    self.chestAreas = map.chestAreas;
    self.chests = map.chests;

    self.loadStaticEntities();

    self.tilesets = map.tilesets;
    self.lights = map.lights;
    self.plateau = map.plateau;
    self.objects = map.objects;
    self.cursors = map.cursors;
    self.trees = map.trees;

    self.zoneWidth = 25;
    self.zoneHeight = 20;

    /**
     * These are temporarily hardcoded,
     * but we will use a dynamic approach.
     */
    self.regionWidth = 40;
    self.regionHeight = 20;

    self.areas = {};

    self.loadAreas();
    self.loadDoors();

    self.ready = true;

    self.readyInterval = setInterval(() => {
      if (!self.world.ready) {
        if (self.readyCallback) self.readyCallback();
        else {
          clearInterval(self.readyInterval);
          self.readyInterval = null;
        }
      }
    }, 50);
  }

  loadAreas() {
    const self = this;

    /**
     * The structure for the new self.areas is as follows:
     *
     * self.areas = {
     *      pvpAreas = {
     *          allPvpAreas
     *      },
     *
     *      musicAreas = {
     *          allMusicAreas
     *      },
     *
     *      ...
     * }
     */

    self.areas.PVP = new PVPAreas();
    self.areas.Music = new MusicAreas();
    self.areas.Chests = new ChestAreas(self.world);
    self.areas.Overlays = new OverlayAreas();
    self.areas.Cameras = new CameraAreas();
  }

  loadDoors() {
    const self = this;

    self.doors = {};

    _.each(map.doors, door => {
      let orientation;

      switch (door.o) {
        case "u":
          orientation = Modules.Orientation.Up;
          break;

        case "d":
          orientation = Modules.Orientation.Down;
          break;

        case "l":
          orientation = Modules.Orientation.Left;
          break;

        case "r":
          orientation = Modules.Orientation.Right;
          break;
      }

      const index = self.gridPositionToIndex(door.x, door.y) + 1;

      self.doors[index] = {
        x: door.tx,
        y: door.ty,
        orientation: orientation,
        portal: door.p ? door.p : 0,
        level: door.l,
        achievement: door.a,
        rank: door.r
      };
    });
  }

  loadStaticEntities() {
    const self = this;

    self.staticEntities = [];

    // Legacy static entities (from Tiled);
    _.each(map.staticEntities, (entity, tileIndex) => {
      self.staticEntities.push({
        tileIndex: tileIndex,
        string: entity.type,
        roaming: entity.roaming
      });
    });

    _.each(Spawns, data => {
      const tileIndex = self.gridPositionToIndex(data.x, data.y);

      self.staticEntities.push({
        tileIndex: tileIndex,
        string: data.string,
        roaming: data.roaming,
        miniboss: data.miniboss,
        achievementId: data.achievementId,
        boss: data.boss
      });
    });
  }

  indexToGridPosition(tileIndex) {
    const self = this;

    tileIndex -= 1;

    const x = self.getX(tileIndex + 1, self.width);
    const y = Math.floor(tileIndex / self.width);

    return {
      x: x,
      y: y
    };
  }

  gridPositionToIndex(x, y) {
    return y * this.width + x;
  }

  getX(index, width) {
    if (index === 0) return 0;

    return index % width === 0 ? width - 1 : (index % width) - 1;
  }

  getRandomPosition(area) {
    const self = this;
    const pos = {};
    let valid = false;

    while (!valid) {
      pos.x = area.x + Utils.randomInt(0, area.width + 1);
      pos.y = area.y + Utils.randomInt(0, area.height + 1);
      valid = self.isValidPosition(pos.x, pos.y);
    }

    return pos;
  }

  inArea(posX, posY, x, y, width, height) {
    return posX >= x && posY >= y && posX <= width + x && posY <= height + y;
  }

  inTutorialArea(entity) {
    const self = this;

    if (entity.x === -1 || entity.y === -1) return true;

    return (
      self.inArea(entity.x, entity.y, 370, 36, 10, 10) ||
      self.inArea(entity.x, entity.y, 312, 11, 25, 22) ||
      self.inArea(entity.x, entity.y, 399, 18, 20, 15)
    );
  }

  nearLight(light, x, y) {
    const self = this;
    const diff = Math.round(light.distance / 16);
    const startX = light.x - self.zoneWidth - diff;
    const startY = light.y - self.zoneHeight - diff;
    const endX = light.x + self.zoneWidth + diff;
    const endY = light.y + self.zoneHeight + diff;

    return x > startX && y > startY && x < endX && y < endY;
  }

  isObject(id) {
    return this.objects.indexOf(id) > -1;
  }

  getPositionObject(x, y) {
    const self = this;
    const index = self.gridPositionToIndex(x, y);
    const tiles = self.clientMap.data[index];
    let objectId;

    if (tiles instanceof Array) {
      for (const i in tiles) {
        if (self.isObject(tiles[i])) objectId = tiles[i];
        else if (self.isObject(tiles)) objectId = tiles;
      }
    }

    return objectId;
  }

  getTree(x, y) {
    const self = this;
    const index = self.gridPositionToIndex(x, y) - 1;
    const tiles = self.clientMap.data[index];

    if (tiles instanceof Array) {
      for (const i in tiles) if (tiles[i] in self.trees) return tiles[i];
    }

    if (tiles in self.trees) return tiles;

    return null;
  }

  isDoor(x, y) {
    return !!this.doors[this.gridPositionToIndex(x, y) + 1];
  }

  getDoorDestination(x, y) {
    return this.doors[this.gridPositionToIndex(x, y) + 1];
  }

  isValidPosition(x, y) {
    return (
      isInt(x) &&
      isInt(y) &&
      !this.isOutOfBounds(x, y) &&
      !this.isColliding(x, y)
    );
  }

  isOutOfBounds(x, y) {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  isPlateau(index) {
    return index in this.plateau;
  }

  isColliding(x, y) {
    const self = this;

    if (self.isOutOfBounds(x, y)) return false;

    const tileIndex = self.gridPositionToIndex(x, y);

    return self.collisions.indexOf(tileIndex) > -1;
  }

  /* For preventing NPCs from roaming in null areas. */
  isEmpty(x, y) {
    const self = this;

    if (self.isOutOfBounds(x, y)) return true;

    const tileIndex = self.gridPositionToIndex(x, y);

    return self.clientMap.data[tileIndex] === 0;
  }

  getPlateauLevel(x, y) {
    const self = this;
    const index = self.gridPositionToIndex(x, y);

    if (!self.isPlateau(index)) return 0;

    return self.plateau[index];
  }

  getActualTileIndex(tileIndex) {
    const self = this;
    const tileset = self.getTileset(tileIndex);

    if (!tileset) return;

    return tileIndex - tileset.firstGID - 1;
  }

  getTileset(tileIndex) {
    const self = this;
    /**
         * if (id > self.tilesets[idx].firstGID - 1 &&
         id < self.tilesets[idx].lastGID + 1)
         return self.tilesets[idx];
         */

    for (const id in self.tilesets) {
      if (self.tilesets.hasOwnProperty(id)) {
        if (
          tileIndex > self.tilesets[id].firstGID - 1 &&
          tileIndex < self.tilesets[id].lastGID + 1
        ) {
          return self.tilesets[id];
        }
      }
    }

    return null;
  }

  isReady(callback) {
    this.readyCallback = callback;
  }
}

module.exports = Map;
