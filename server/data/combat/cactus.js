const Combat = require("../../js/game/entity/character/combat/combat");
const Hit = require("../../js/game/entity/character/combat/hit");
const Modules = require("../../js/util/modules");

class Cactus extends Combat {
  constructor(character) {
    character.spawnDistance = 10;
    character.alwaysAggressive = true;

    super(character);

    this.character = character;

    this.character.onDamaged((damage, attacker) => {
      if (!attacker || !attacker.armour || attacker.isRanged())
      { return; }

      this.damageAttacker(damage, attacker);

      log.debug(`Entity ${this.character.id} damaged ${damage} by ${attacker.instance}.`);
    });

    this.character.onDeath(() => {
      this.forEachAttacker((attacker) => {
        this.damageAttacker(this.character.maxHitPoints, attacker);
      });

      log.debug("Oh noes, le cactus did a die. :(");
    });
  }

  damageAttacker(damage, attacker) {
    if (!attacker || !attacker.armour || attacker.isRanged())
    { return; }

    /**
         * This is the formula for dealing damage when a player
         * attacks the cactus. Eventually the damage will cancel out
         * as the armour gets better.
         **/

    const defense = attacker.armour.getDefense();
    const calculatedDamage = Math.floor((damage / 2) - (defense * 5));

    if (calculatedDamage < 1)
    { return; }

    const hitInfo = new Hit(Modules.Hits.Damage, calculatedDamage).getData();

    this.hit(this.character, attacker, hitInfo, true);
  }
}

module.exports = Cactus;
