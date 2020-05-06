import Animation from "./animation";

class Sprite {
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

    this.offsetX = sprite.offsetX !== undefined ? sprite.offsetX : -16;
    this.offsetY = sprite.offsetY !== undefined ? sprite.offsetY : -16;
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
      if (this.animationData.hasOwnProperty(name)) {
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
