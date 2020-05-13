import Entity from "../entity";

/**
 * @class Projectile
 * @extends {Entity}
 */
class Projectile extends Entity {
  /**
   * Creates an instance of Projectile.
   *
   * @param {number} id
   * @param {number} kind
   * @param {string} owner
   *
   * @memberof Projectile
   */
  constructor(id, kind, owner) {
    super(id, kind);

    this.owner = owner;

    this.name = "";

    this.startX = -1;
    this.startY = -1;

    this.destX = -1;
    this.destY = -1;

    this.special = -1;

    this.static = false;
    this.dynamic = false;

    this.speed = 150;

    this.angle = 0;

    this.lighting = null;
  }

  getId() {
    return this.id;
  }

  impact() {
    if (this.impactCallback) {
      this.impactCallback();
    }
  }

  setStart(x, y) {
    this.setGridPosition(Math.floor(x / 32), Math.floor(y / 32));

    this.startX = x;
    this.startY = y;
  }

  setDestination(x, y) {
    this.static = true;

    this.destX = x;
    this.destY = y;

    this.updateAngle();
  }

  setTarget(target) {
    if (!target) {
      return;
    }

    this.dynamic = true;

    this.destX = target.x;
    this.destY = target.y;

    this.updateAngle();

    if (target.type !== "mob") {
      return;
    }

    target.onMove(() => {
      this.destX = target.x;
      this.destY = target.y;

      this.updateAngle();
    });
  }

  getSpeed() {
    return 1;
  }

  updateTarget(x, y) {
    this.destX = x;
    this.destY = y;
  }

  hasPath() {
    return false;
  }

  updateAngle() {
    this.angle =
      Math.atan2(this.destY - this.y, this.destX - this.x) * (180 / Math.PI) -
      90;
  }

  onImpact(callback) {
    this.impactCallback = callback;
  }
}

export default Projectile;
