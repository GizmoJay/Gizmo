/**
 *
 *
 * @class Animation
 */
class Animation {
  /**
   * Creates an instance of Animation.
   *
   * @param {string} name
   * @param {number} column
   * @param {number} row
   * @param {number} width
   * @param {number} height
   *
   * @memberof Animation
   */
  constructor(name, column, row, width, height) {
    this.name = name;
    this.length = length;
    this.row = row;
    this.column = column;
    this.width = width;
    this.height = height;

    this.reset();
  }

  tick() {
    let i = this.currentFrame.index;

    i = i < this.length - 1 ? i + 1 : 0;

    if (this.count > 0 && i === 0) {
      this.count -= 1;

      if (this.count === 0) {
        this.currentFrame.index = 0;
        this.endCountCallback();
        return;
      }
    }

    this.currentFrame.x = this.width * this.column;
    this.currentFrame.y = this.height * this.row;

    this.currentFrame.index = i;
  }

  update(time) {
    if (this.lastTime === 0 && this.name.substr(0, 3) === "atk") {
      this.lastTime = time;
    }

    if (this.readyToAnimate(time)) {
      this.lastTime = time;
      this.tick();

      return true;
    } else {
      return false;
    }
  }

  setCount(count, onEndCount) {
    this.count = count;
    this.endCountCallback = onEndCount;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setRow(row) {
    this.row = row;
  }

  setColumn(column) {
    this.column = column;
  }

  readyToAnimate(time) {
    return time - this.lastTime > this.speed;
  }

  reset() {
    this.lastTime = 0;
    this.currentFrame = {
      index: 0,
      x: this.column * this.width,
      y: this.row * this.height
    };
  }
}

export default Animation;
