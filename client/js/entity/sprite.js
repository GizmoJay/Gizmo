import Animation from "./animation";

/**
 * @typedef {Object.<string, number>} SpriteAnimationRow
 * @property {number} SpriteAnimationRow.length
 * @property {number} SpriteAnimationRow.row
 */

/**
 * @typedef {Object} SpriteAnimation
 * @property {SpriteAnimationRow} atk_down
 * @property {SpriteAnimationRow} walk_down
 * @property {SpriteAnimationRow} idle_down
 * @property {SpriteAnimationRow} atk_up
 * @property {SpriteAnimationRow} walk_up
 * @property {SpriteAnimationRow} idle_up
 * @property {SpriteAnimationRow} atk_right
 * @property {SpriteAnimationRow} walk_right
 * @property {SpriteAnimationRow} idle_right
 * @property {SpriteAnimationRow} atk_left
 * @property {SpriteAnimationRow} walk_left
 * @property {SpriteAnimationRow} idle_left
 */

/**
 * @class Sprite
 */
class Sprite {
  /**
   * Creates an instance of Sprite.
   *
   * @param {Object} sprite
   * @param {string} sprite.id
   * @param {number} sprite.width
   * @param {number} sprite.height
   * @param {SpriteAnimation} sprite.animation
   * @param {number} sprite.offsetX
   * @param {number} sprite.offsetY
   * @param {number} scale
   *
   * @memberof Sprite
   */
  constructor(sprite, scale) {
    this.sprite = sprite;
    this.scale = scale;

    this.id = sprite.id;

    this.loaded = false;
    this.loadHurt = false;

    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetAngle = 0;

    this.hurtSprite = {
      loaded: false
    };

    this.loadSprite();
  }

  load() {
    this.image = new Image();
    this.image.crossOrigin = "Anonymous";
    this.image.src = this.filepath;

    this.image.onload = () => {
      this.loaded = true;

      if (this.loadHurt) {
        this.createHurtSprite();
      }

      if (this.loadCallback) {
        this.loadCallback();
      }
    };
  }

  loadSprite() {
    const sprite = this.sprite;

    this.filepath = require(`../../img/sprites/${this.id}.png`).default;

    this.animationData = sprite.animations;

    this.width = sprite.width;
    this.height = sprite.height;

    this.offsetX = sprite.offsetX !== undefined ? sprite.offsetX : -32;
    this.offsetY = sprite.offsetY !== undefined ? sprite.offsetY : -32;
    this.offfsetAngle =
      sprite.offsetAngle !== undefined ? sprite.offsetAngle : 0;

    this.idleSpeed = sprite.idleSpeed !== undefined ? sprite.idleSpeed : 450;
  }

  update(newScale) {
    this.scale = newScale;

    this.loadSprite();
    this.load();
  }

  createAnimations() {
    const animations = {};

    for (const name in this.animationData) {
      if (Object.prototype.hasOwnProperty.call(this.animationData, name)) {
        if (name === "death") {
          // Check if sprite has a death animation
          this.hasDeathAnimation = true;
        }

        const a = this.animationData[name];

        animations[name] = new Animation(
          name,
          a.length,
          a.row,
          this.width,
          this.height
        );
      }
    }

    return animations;
  }

  /**
   * This is when an entity gets hit, they turn red then white.
   */

  createHurtSprite() {
    if (!this.loaded) {
      this.load();
    }

    if (this.hurtSprite.loaded) {
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let spriteData;
    let data;

    canvas.width = this.image.width;
    canvas.height = this.image.height;

    try {
      context.drawImage(this.image, 0, 0, this.image.width, this.image.height);

      spriteData = context.getImageData(
        0,
        0,
        this.image.width,
        this.image.height
      );
      data = spriteData.data;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = data[i + 2] = 75;
      }

      spriteData.data.set(data);

      context.putImageData(spriteData, 0, 0);

      this.hurtSprite = {
        image: canvas,
        loaded: true,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        width: this.width,
        height: this.height,
        type: "hurt"
      };
    } catch (e) {
      log.error("Could not load hurt sprite.");
      log.error(e);
    }
  }

  onLoad(callback) {
    this.loadCallback = callback;
  }
}

export default Sprite;
