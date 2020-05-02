define(["../entity"], Entity => {
  return class Item extends Entity {
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
  };
});
