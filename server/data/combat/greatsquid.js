const Combat = require("../../js/game/entity/character/combat/combat");
const Modules = require("../../js/util/modules");

class GreatSquid extends Combat {
  constructor(character) {
    character.spawnDistance = 15;
    super(character);

    this.character = character;

    this.lastTerror = new Date().getTime();
  }

  hit(character, target, hitInfo) {
    if (this.canUseTerror) {
      hitInfo.type = Modules.Hits.Stun;

      this.lastTerror = new Date().getTime();
    }

    super.hit(character, target, hitInfo);
  }

  canUseTerror() {
    return new Date().getTime() - this.lastTerror > 15000;
  }
}

module.exports = GreatSquid;
