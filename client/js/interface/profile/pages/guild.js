import Page from "../page";
import Game from "../../../game";

/**
 * @class Guild
 * @extends {Page}
 */
class Guild extends Page {
  /**
   * Creates an instance of Guild.
   *
   * @param {Game} game
   *
   * @memberof Guild
   */
  constructor(game) {
    super("#guildPage");

    this.game = game;
  }
}
export default Guild;
