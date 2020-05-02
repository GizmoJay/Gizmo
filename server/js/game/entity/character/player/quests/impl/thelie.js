/* global module */

const Quest = require("../quest");

class Thelie extends Quest {
  constructor(player, data) {
    super(player, data);

    const self = this;

    self.player = player;
    self.data = data;
  }

  load(stage) {
    const self = this;

    super.load(stage);
  }
}

module.exports = Thelie;