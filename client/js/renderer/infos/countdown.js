/**
 * @class Countdown
 */
class Countdown {
  /**
   * Creates an instance of Countdown.
   *
   * @param {number} id
   * @param {number} time
   *
   * @memberof Countdown
   */
  constructor(id, time) {
    this.id = id;
    this.time = time;
    this.string = null;

    this.lastTime = 0;
    this.updateTime = 1000; // Update every second.
  }

  tick() {
    if (time < 1) {
      return;
    }

    // Originally was gonna do this in the renderer
    // But it's best to update the string here.

    this.string = this.getStringFormat();

    time--;
  }

  update(time) {
    if (time - this.lastTime > this.updateTime) {
      this.lastTime = time;
    }
  }

  getStringFormat() {
    if (this.time < 60) {
      return "00:" + this.time;
    }

    const minutes = Math.floor(this.time / 60);
    const seconds = this.time - minutes * 60;

    if (minutes < 10) {
      return "0" + minutes + ":" + seconds;
    }

    return minutes + ":" + seconds;
  }
}

export default Countdown;
