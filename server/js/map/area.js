/* global module */

class Area {
  constructor(id, x, y, width, height) {
    const self = this;

    self.id = id;

    self.x = x;
    self.y = y;

    self.width = width;
    self.height = height;

    self.entities = [];
    self.items = [];

    self.hasRespawned = true;
    self.chest = null;

    self.maxEntities = 0;
    self.spawnDelay = 0;
  }

  contains(x, y) {
    return (
      x >= this.x &&
      y >= this.y &&
      x < this.x + this.width &&
      y < this.y + this.height
    );
  }

  addEntity(entity) {
    const self = this;

    if (self.entities.indexOf(entity) > 0) return;

    self.entities.push(entity);
    entity.area = self;

    // Grab a spawn delay from an mob to create an offset for the chest.
    if (!self.spawnDelay) self.spawnDelay = entity.respawnDelay;

    if (self.spawnCallback) self.spawnCallback();
  }

  removeEntity(entity) {
    const self = this;
    const index = self.entities.indexOf(entity);

    if (index > -1) self.entities.splice(index, 1);

    if (self.entities.length === 0 && self.emptyCallback) {
      if (entity.lastAttacker && entity.lastAttacker.type === "player") {
        self.handleAchievement(entity.lastAttacker);
      }

      self.emptyCallback();
    }
  }

  handleAchievement(entity) {
    const self = this;

    if (!self.achievement) return;

    entity.finishAchievement(self.achievement);
  }

  setMaxEntities(maxEntities) {
    this.maxEntities = maxEntities;
  }

  onEmpty(callback) {
    this.emptyCallback = callback;
  }

  onSpawn(callback) {
    this.spawnCallback = callback;
  }
}

module.exports = Area;
