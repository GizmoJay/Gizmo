import Game from "../game";

/**
 * @class Notification
 */
class Notification {
  /**
   * Creates an instance of Notification.
   *
   * @param {Game} game
   *
   * @memberof Notification
   */
  constructor(game) {
    this.game = game;

    this.notificationPanel = $("#notification");
    this.notificationText = $("#notificationText");
  }
}

export default Notification;
