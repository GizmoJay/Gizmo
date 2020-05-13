import Equipment from "./equipment";

/**
 * @class Weapon
 * @extends {Equipment}
 */
class Weapon extends Equipment {
  /**
   * Creates an instance of Weapon.
   *
   * @param {string} name
   * @param {string} string
   * @param {number} count
   * @param {number} ability
   * @param {number} abilityLevel
   * @param {number} power
   *
   * @memberof Weapon
   */
  constructor(name, string, count, ability, abilityLevel, power) {
    super(name, string, count, ability, abilityLevel, power);

    this.level = -1;
    this.damage = -1;
    this.ranged = string && string.includes("bow");
  }

  setDamage(damage) {
    this.damage = damage;
  }

  setLevel(level) {
    this.level = level;
  }

  getDamage() {
    return this.damage;
  }

  getLevel() {
    return this.level;
  }
}

export default Weapon;
