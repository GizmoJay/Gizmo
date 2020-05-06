import Sprite from "../entity/sprite";
import Animation from "../entity/animation";
import sprites from "../../data/sprites.json";

/**
 * Class responsible for loading all the necessary sprites from the JSON.
 */
class Sprites {
  constructor(renderer) {
    this.renderer = renderer;

    this.sprites = {};

    this.sparksAnimation = null;

    this.load(sprites);

    this.loadAnimations();
  }

  load(spriteData) {
    _.each(spriteData, sprite => {
      this.sprites[sprite.id] = new Sprite(sprite, this.renderer.scale);
    });

    if (this.renderer.game.isDebug()) {
      log.info("Finished loading sprite data...");
    }

    if (this.loadedSpritesCallback) {
      this.loadedSpritesCallback();
    }
  }

  loadAnimations() {
    this.sparksAnimation = new Animation("idle_down", 6, 0, 16, 16);
    this.sparksAnimation.setSpeed(120);
  }

  updateSprites() {
    _.each(this.sprites, sprite => {
      sprite.update(this.renderer.getScale());
    });

    if (this.renderer.game.isDebug()) {
      log.info(`Updated sprites to scale: ${this.renderer.getScale()}`);
    }
  }
}

export default Sprites;
