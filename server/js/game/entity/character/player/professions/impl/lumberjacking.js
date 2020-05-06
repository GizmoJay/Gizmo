const _ = require("underscore");
const Packets = require("../../../../../../network/packets");
const Messages = require("../../../../../../network/messages");
const Profession = require("./profession");
const Modules = require("../../../../../../util/modules");
const Utils = require("../../../../../../util/utils");
const Trees = require("../../../../../../../data/trees");

class Lumberjacking extends Profession {
  constructor(id, player) {
    super(id, player);

    this.tick = 1000;

    this.cuttingInterval = null;
    this.started = false;
  }

  start() {
    if (this.started) return;

    this.cuttingInterval = setInterval(() => {
      if (this.world.isTreeCut(this.treeObjectId)) {
        this.stop();
        return;
      }

      if (!this.treeId || !this.treeObjectId) return;

      this.player.sendToRegion(
        new Messages.Animation(this.player.instance, {
          action: Modules.Actions.Attack
        })
      );

      if (Utils.randomInt(0, Trees.Chances[this.treeId]) === 4)
      { this.world.destroyTree(this.treeObjectId, Modules.Trees[this.treeId]); }
    }, this.tick);

    this.started = true;
  }

  stop() {
    if (!this.started) return;

    this.treeId = null;
    this.treeObjectId = null;

    clearInterval(this.cuttingInterval);
    this.cuttingInterval = null;

    this.started = false;
  }

  handle(id, treeId) {
    this.treeId = treeId;
    this.treeObjectId = id;

    this.start();
  }

  getQueueCount() {
    return Object.keys(this.queuedTrees).length;
  }
}

module.exports = Lumberjacking;
