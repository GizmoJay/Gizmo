const _ = require("underscore");
const Modules = require("../../../../../util/modules");

class Professions {
  constructor(player) {
    const self = this;

    self.player = player;

    self.professions = {};

    self.load();
  }

  load() {
    const self = this;
    const pList = Object.keys(Modules.Professions); // professions enum list

    /**
     * We are accessing all the professions in the Modules.Professions
     * enum. We use the key to generate the profession class instance.
     */

    _.each(pList, profession => {
      try {
        const ProfessionClass = require(`./impl/${profession}`);
        const id = Modules.Professions[profession];

        self.professions[id] = new ProfessionClass(id);
      } catch (e) {
        log.debug(`Could not load ${profession} profession.`);
      }
    });
  }

  update(info) {
    const self = this;

    _.each(info, (data, id) => {
      if (!(id in self.professions)) return;

      self.professions[id].load(data);
    });
  }

  getProfession(id) {
    const self = this;

    if (!(id in self.professions)) return null;

    return self.professions[id];
  }

  getArray() {
    const self = this;
    const data = {};

    _.each(self.professions, profession => {
      data[profession.id] = profession.getData();
    });

    return {
      username: self.player.username,
      data: data
    };
  }
}

module.exports = Professions;
