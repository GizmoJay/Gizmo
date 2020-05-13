import Timer from "../../utils/timer";

/**
 * @class Blob
 */
class Blob {
  /**
   * Creates an instance of Blob.
   *
   * @param {number} id
   * @param {string} element
   * @param {number} duration
   * @param {boolean} isObject
   * @param {Object} info
   *
   * @memberof Blob
   */
  constructor(id, element, duration, isObject, info) {
    this.id = id;
    this.element = element;
    this.duration = duration || 5000;

    this.time = new Date().getTime();
    this.timer = new Timer(this.time, this.duration);

    if (isObject) {
      this.type = "object";
      this.info = info;
    }
  }

  isOver(time) {
    return this.timer.isOver(time);
  }

  reset(time) {
    this.timer.time = time;
  }

  destroy() {
    $(this.element).remove();
  }
}

export default Blob;
