import Timer from "../../utils/timer";

class Blob {
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
