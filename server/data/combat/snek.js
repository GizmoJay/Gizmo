const Combat = require("../../js/game/entity/character/combat/combat");
const Hit = require("../../js/game/entity/character/combat/hit");
const Utils = require("../../js/util/utils");
const Modules = require("../../js/util/modules");

class Snek extends Combat {
  constructor(character) {
    character.spawnDistance = 15;
    super(character);

    this.character = character;

    this.character.onDamage((target, hitInfo) => {
      if (!target || target.type !== "player") {
        return;
      }

      if (this.canPoison()) {
        target.setPoison(this.getPoisonData());
      }

      log.info(
        `Entity ${this.character.id} hit ${target.instance} - damage ${hitInfo.damage}.`
      );
    });
  }

  canPoison() {
    const chance = Utils.randomInt(0, this.character.level);

    return chance === 7;
  }

  getPoisonData() {
    return new Date().getTime().toString() + ":30000:1";
  }
}

module.exports = Snek;
