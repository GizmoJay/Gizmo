define(["./equipment"], Equipment => {
  return class Pendant extends Equipment {
    constructor(name, string, count, ability, abilityLevel, power) {
      super(name, string, count, ability, abilityLevel, power);
    }
  };
});
