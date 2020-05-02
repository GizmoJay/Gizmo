import Equipment from "./equipment";

class Armour extends Equipment {
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
