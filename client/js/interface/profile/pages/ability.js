import Page from "../page";
import Game from "../../../game";

/**
 * @class Ability
 * @extends {Page}
 */
class Ability extends Page {
  /**
   * Creates an instance of Ability.
   *
   * @param {Game} game
   *
   * @memberof Ability
   */
  constructor(game) {
    super("#skillPage");

    this.game = game;
  }
}

export default Ability;
