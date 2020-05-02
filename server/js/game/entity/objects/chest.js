/* global module */

const Entity = require("../entity");
const Utils = require("../../../util/utils");

class Chest extends Entity {
  constructor(id, instance, x, y) {
    super(id, "chest", instance, x, y);

    const self = this;

    self.respawnDuration = 25000;
    self.static = false;

    self.items = [];
  }

  openChest() {
    const self = this;

    if (self.openCallback) {
      self.openCallback();
    }
  }

  respawn() {
    const self = this;

    setTimeout(() => {
      if (self.respawnCallback) {
        self.respawnCallback();
      }
    }, self.respawnDuration);
  }

  getItem() {
    const self = this;
    const random = Utils.randomInt(0, self.items.length - 1);
    let item = self.items[random];
    let count = 1;
    let probability = 100;

    if (item.includes(":")) {
      const itemData = item.split(":");

      item = itemData.shift(); // name
      count = parseInt(itemData.shift()); // count
      probability = parseInt(itemData.shift()); // probability
    }

    /**
     * We must ensure an item is always present in order
     * to avoid any unforeseen circumstances.
     */
    if (!item) {
      return null;
    }

    if (Utils.randomInt(0, 100) > probability) {
      return null;
    }

    return {
      string: item,
      count: count
    };
  }

  onOpen(callback) {
    this.openCallback = callback;
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }
}

module.exports = Chest;
