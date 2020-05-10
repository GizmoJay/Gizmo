import Slot from "./slot";

/**
 *
 *
 * @class Container
 */
class Container {
  /**
   * Creates an instance of Container.
   *
   * @param {number} size
   *
   * @memberof Container
   */
  constructor(size) {
    this.size = size;

    this.slots = [];

    for (let i = 0; i < this.size; i++) {
      this.slots.push(new Slot(i));
    }
  }

  /**
   * We receive information from the server here,
   * so we mustn't do any calculations. Instead,
   * we just modify the container directly.
   */
  setSlot(index, info) {
    this.slots[index].load(
      info.string,
      info.count,
      info.ability,
      info.abilityLevel,
      info.edible,
      info.equippable
    );
  }

  getEmptySlot() {
    for (let i = 0; i < this.slots; i++) {
      if (!this.slots[i].string) {
        return i;
      }
    }

    return -1;
  }

  getImageFormat(scale, name) {
    if (scale === 1) {
      scale = 2;
    }

    return `url("${
      require(`../../../img/${scale}/item-${name}.png`).default
    }")`;
  }
}

export default Container;
