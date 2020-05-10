/* global module */

const Quest = require("../quest");
const Packets = require("../../../../../network/packets");

class Thelie extends Quest {
  constructor(player, data) {
    super(player, data);

    this.player = player;
    this.data = data;
  }

  load(stage) {
    super.load(stage);
  }
}

module.exports = Thelie;
