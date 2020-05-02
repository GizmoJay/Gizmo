define(["../character"], Character => {
  return class NPC extends Character {
    constructor(id, kind) {
      super(id, kind);

      this.type = "npc";
    }
  };
});
