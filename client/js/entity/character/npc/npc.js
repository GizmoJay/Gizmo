import Character from "../character";

/**
 *
 *
 * @class NPC
 * @extends {Character}
 */
class NPC extends Character {
  /**
   * Creates an instance of NPC.
   *
   * @param {number} id
   * @param {number} kind
   *
   * @memberof NPC
   */
  constructor(id, kind) {
    super(id, kind);

    this.type = "npc";
  }
}

export default NPC;
