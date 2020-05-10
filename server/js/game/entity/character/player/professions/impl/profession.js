const Modules = require("../../../../../../util/modules");

class Profession {
  constructor(id, player) {
    this.id = id;
    this.player = player;

    this.world = player.world;

    this.map = this.world.map;
    this.region = this.world.region;

    this.experience = 0;
  }

  load(data) {
    this.experience = data.experience;
  }

  getData() {
    return {
      experience: this.experience
    };
  }
}

module.exports = Profession;
