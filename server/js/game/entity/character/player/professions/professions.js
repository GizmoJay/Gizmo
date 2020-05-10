const _ = require("underscore");
const Modules = require("../../../../../util/modules");

class Professions {
  constructor(player) {
    this.player = player;
    this.world = player.world;

    this.professions = {};

    this.load();
  }

  load() {
    const pList = Object.keys(Modules.Professions); // professions enum list

    /**
     * We are accessing all the professions in the Modules.Professions
     * enum. We use the key to generate the profession class instance.
     */

    _.each(pList, profession => {
      try {
        const ProfessionClass = require(`./impl/${profession}`);
        const id = Modules.Professions[profession];

        this.professions[id] = new ProfessionClass(id, this.player);
      } catch (e) {
        log.debug(`Could not load ${profession} profession.`);
        log.error(e);
      }
    });
  }

  update(info) {
    _.each(info, (data, id) => {
      if (!(id in this.professions)) return;

      this.professions[id].load(data);
    });
  }

  getProfession(id) {
    if (!(id in this.professions)) return null;

    return this.professions[id];
  }

  getArray() {
    const data = {};

    _.each(this.professions, profession => {
      data[profession.id] = profession.getData();
    });

    return {
      email: this.player.email,
      data: data
    };
  }
}

module.exports = Professions;
