/**
 * Very useful file used for queuing various objects,
 * most notably used in the info controller to queue
 * objects to delete.
 *
 * @class Queue
 */
class Queue {
  /**
   * Creates an instance of Queue.
   *
   * @memberof Queue
   */
  constructor() {
    this.queue = [];
  }

  reset() {
    this.queue = [];
  }

  add(object) {
    this.queue.push(object);
  }

  getQueue() {
    return this.queue;
  }

  forEachQueue(callback) {
    _.each(this.queue, object => {
      callback(object);
    });
  }
}

export default Queue;
