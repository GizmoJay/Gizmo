/* global module */

const TeamWar = require("../minigames/impl/teamwar");

class Minigames {
  constructor(world) {
    const self = this;

    self.world = world;

    self.minigames = {};

    self.load();
  }

  load() {
    const self = this;

    self.minigames.TeamWar = new TeamWar(self.world);

    log.info(
      `Finished loading ${Object.keys(self.minigames).length} minigames.`
    );
  }

  getTeamWar() {
    return this.minigames.TeamWar;
  }
}

module.exports = Minigames;
