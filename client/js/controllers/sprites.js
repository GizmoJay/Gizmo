/* global log, _ */

define(["../entity/sprite", "../entity/animation"], (Sprite, Animation) => {
  /**
   * Class responsible for loading all the necessary sprites from the JSON.
   */

  return class {
    constructor(renderer) {
      this.renderer = renderer;

      this.sprites = {};

      this.sparksAnimation = null;

      $.getJSON("data/sprites.json", json => {
        this.load(json);
      });

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
        log.info("Updated sprites to scale: " + this.renderer.getScale());
      }
    }

    onLoadedSprites(callback) {
      this.loadedSpritesCallback = callback;
    }
  };
});
