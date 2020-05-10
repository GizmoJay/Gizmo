import Character from "../character";

/**
 *
 *
 * @class Mob
 * @extends {Character}
 */
class Mob extends Character {
  /**
   * Creates an instance of Mob.
   *
   * @param {number} id
   * @param {number} kind
   *
   *  @memberof Mob
   */
  constructor(id, kind) {
    super(id, kind);

    this.name = name;

    this.hitPoints = -1;
    this.maxHitPoints = -1;

    this.hiddenName = false;

    this.type = "mob";
  }

  setName(name) {
    this.name = name;
  }

  hasShadow() {
    return !this.hiddenName;
  }

  drawNames() {
    return !this.hiddenName;
  }
}

export default Mob;
