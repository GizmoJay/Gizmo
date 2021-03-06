/* global module */

const _ = require("underscore");
const DoorData = require("../../../../../data/doors");
const Messages = require("../../../../network/messages");
const Packets = require("../../../../network/packets");

class Doors {
  constructor(player) {
    this.world = player.world;
    this.player = player;
    this.map = this.world.map;
    this.regions = this.map.regions;

    this.doors = {};

    this.load();
  }

  load() {
    _.each(DoorData, door => {
      this.doors[door.id] = {
        id: door.id,
        x: door.x,
        y: door.y,
        status: door.status,
        requirement: door.requirement,
        level: door.level,
        questId: door.questId,
        achievementId: door.achievementId,
        closedIds: door.closedIds,
        openIds: door.openIds
      };
    });
  }

  getStatus(door) {
    if (door.status) return door.status;

    if (config.offlineMode) return true;

    switch (door.requirement) {
      case "quest": {
        const quest = this.player.quests.getQuest(door.questId);

        return quest && quest.hasDoorUnlocked(door) ? "open" : "closed";
      }

      case "achievement": {
        const achievement = this.player.quests.getAchievement(
          door.achievementId
        );

        return achievement && achievement.isFinished() ? "open" : "closed";
      }

      case "level":
        return this.player.level >= door.level ? "open" : "closed";
    }
  }

  getTiles(door) {
    const tiles = {
      indexes: [],
      data: [],
      collisions: []
    };

    const status = this.getStatus(door);
    const doorState = {
      open: door.openIds,
      closed: door.closedIds
    };

    _.each(doorState[status], (value, key) => {
      tiles.indexes.push(parseInt(key));
      tiles.data.push(value.data);
      tiles.collisions.push(value.isColliding);
    });

    return tiles;
  }

  getAllTiles() {
    const allTiles = {
      indexes: [],
      data: [],
      collisions: []
    };

    _.each(this.doors, door => {
      /* There's no need to send dynamic data if the player is not nearby. */
      const doorRegion = this.regions.regionIdFromPosition(door.x, door.y);

      if (!this.regions.isSurrounding(this.player.region, doorRegion)) return;

      const tiles = this.getTiles(door);

      allTiles.indexes.push.apply(allTiles.indexes, tiles.indexes);
      allTiles.data.push.apply(allTiles.data, tiles.data);
      allTiles.collisions.push.apply(allTiles.collisions, tiles.collisions);
    });

    return allTiles;
  }

  hasCollision(x, y) {
    const tiles = this.getAllTiles();
    const tileIndex = this.world.map.gridPositionToIndex(x, y);
    const index = tiles.indexes.indexOf(tileIndex);

    /**
     * We look through the indexes of the door json file and
     * only process for collision when tile exists in the index.
     * The index represents the key in `openIds` and `closedIds`
     * in doors.json file.
     */

    if (index < 0) {
      // Tile does not exist.
      return false;
    }

    return tiles.collisions[index];
  }

  getDoor(x, y, callback) {
    for (const i in this.doors) {
      if (Object.prototype.hasOwnProperty.call(this.doors, i)) {
        if (this.doors[i].x === x && this.doors[i].y === y) {
          return this.doors[i];
        }
      }
    }

    return null;
  }

  isDoor(x, y, callback) {
    this.forEachDoor(door => {
      callback(door.x === x && door.y === y);
    });
  }

  forEachDoor(callback) {
    _.each(this.doors, door => {
      callback(door);
    });
  }
}

module.exports = Doors;
