import Game from "../game";

/**
 * @class Abilities
 */
class Abilities {
  /**
   * Creates an instance of Abilities.
   *
   * @param {Game} game
   *
   * @memberof Abilities
   */
  constructor(game) {
    this.game = game;

    this.shortcuts = $("#abilityShortcut");
  }

  getList() {
    return this.shortcuts.find("ul");
  }
}

export default Abilities;
