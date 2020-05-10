import Entity from "../entity";

/**
 *
 *
 * @class Item
 * @extends {Entity}
 */
class Item extends Entity {
  /**
   * Creates an instance of Item.
   *
   * @param {number} id
   * @param {number} kind
   * @param {number} count
   * @param {number} ability
   * @param {number} abilityLevel
   *
   * @memberof Item
   */
  constructor(id, kind, count, ability, abilityLevel) {
    super(id, kind);

    this.count = count;
    this.ability = ability;
    this.abilityLevel = abilityLevel;

    this.dropped = false;
    this.stackable = false;

    this.type = "item";
  }

  idle() {
    this.setAnimation("idle", 150);
  }

  hasShadow() {
    return true;
  }
}

export default Item;
