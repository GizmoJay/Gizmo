import Game from "../game";

/**
 * @class Zoning
 */
class Zoning {
  /**
   * Creates an instance of Zoning.
   *
   * @param {Game} game
   *
   * @memberof Zoning
   */
  constructor(game) {
    this.game = game;
    this.renderer = game.renderer;
    this.camera = game.camera;
    this.input = game.input;

    this.direction = null;
  }

  reset() {
    this.direction = null;
  }

  setUp() {
    this.direction = Modules.Orientation.Up;
  }

  setDown() {
    this.direction = Modules.Orientation.Down;
  }

  setRight() {
    this.direction = Modules.Orientation.Right;
  }

  setLeft() {
    this.direction = Modules.Orientation.Left;
  }

  getDirection() {
    return this.direction;
  }
}

export default Zoning;
