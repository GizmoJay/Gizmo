import Equipment from "./equipment";

/**
 * @class Armour
 * @extends {Equipment}
 */
class Armour extends Equipment {
  /**
   * Creates an instance of Armour.
   *
   * @param {string} name
   * @param {string} string
   * @param {number} count
   * @param {number} ability
   * @param {number} abilityLevel
   * @param {number} power
   *
   * @memberof Armour
   */
  constructor(name, string, count, ability, abilityLevel, power) {
    super(name, string, count, ability, abilityLevel, power);

    this.defence = -1;
  }

  setDefence(defence) {
    this.defence = defence;
  }

  getDefence() {
    return this.defence;
  }
}

export default Armour;
