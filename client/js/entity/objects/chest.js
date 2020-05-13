import Entity from "../entity";

/**
 * @class Chest
 * @extends {Entity}
 */
class Chest extends Entity {
  /**
   * Creates an instance of Chest.
   *
   * @param {number} id
   * @param {number} kind
   *
   * @memberof Chest
   */
  constructor(id, kind) {
    super(id, kind);

    this.type = "chest";
  }

  idle() {
    this.setAnimation("idle_down", 150);
  }
}

export default Chest;
