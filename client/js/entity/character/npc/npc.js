import Character from "../character";

class NPC extends Character {
  constructor(id, kind) {
    super(id, kind);

    this.type = "npc";
  }
}

export default NPC;
