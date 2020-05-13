import Game from "../game";
import Queue from "../utils/queue";
import Splat from "../renderer/infos/splat";
import Countdown from "../renderer/infos/countdown";
import { isInt } from "../utils/util";

/**
 * @class Info
 */
class Info {
  /**
   * Creates an instance of Info.
   *
   * @param {Game} game
   *
   * @memberof Info
   */
  constructor(game) {
    this.game = game;

    this.infos = {};
    this.destroyQueue = new Queue();
  }

  create(type, data, x, y) {
    switch (type) {
      case Modules.Hits.Damage:
      case Modules.Hits.Stun:
      case Modules.Hits.Critical: {
        let damage = data.shift();
        const isTarget = data.shift();
        const dId = this.generateId(this.game.time, damage, x, y);

        if (damage < 1 || !isInt(damage)) {
          damage = "MISS";
        }

        const hitSplat = new Splat(dId, type, damage, x, y, false);
        const dColor = isTarget
          ? Modules.DamageColors.received
          : Modules.DamageColors.inflicted;

        hitSplat.setColors(dColor.fill, dColor.stroke);

        this.addInfo(hitSplat);

        break;
      }

      case Modules.Hits.Heal:
      case Modules.Hits.Mana:
      case Modules.Hits.Experience:
      case Modules.Hits.Poison: {
        const amount = data.shift();
        const id = this.generateId(this.game.time, amount, x, y);
        let text = "+";
        let color;

        if (amount < 1 || !isInt(amount)) {
          return;
        }

        if (type !== Modules.Hits.Experience) {
          text = "++";
        }

        if (type === Modules.Hits.Poison) {
          text = "--";
        }

        const splat = new Splat(id, type, text + amount, x, y, false);

        if (type === Modules.Hits.Heal) {
          color = Modules.DamageColors.healed;
        } else if (type === Modules.Hits.Mana) {
          color = Modules.DamageColors.mana;
        } else if (type === Modules.Hits.Experience) {
          color = Modules.DamageColors.exp;
        } else if (type === Modules.Hits.Poison) {
          color = Modules.DamageColors.poison;
        }

        splat.setColors(color.fill, color.stroke);

        this.addInfo(splat);

        break;
      }

      case Modules.Hits.LevelUp: {
        const lId = this.generateId(this.game.time, "-1", x, y);
        const levelSplat = new Splat(lId, type, "Level Up!", x, y, false);
        const lColor = Modules.DamageColors.exp;

        levelSplat.setColors(lColor.fill, lColor.stroke);

        this.addInfo(levelSplat);

        break;
      }

      case Modules.Info.Countdown: {
        /**
         * We only allow the creation of one countdown timer.
         */

        if (countdownExists) {
          return;
        }

        const time = data.shift();
        const countdown = new Countdown("countdown", time);

        this.addInfo(countdown);

        break;
      }
    }
  }

  getCount() {
    return Object.keys(this.infos).length;
  }

  getCountdown() {
    return this.infos.countdown;
  }

  addInfo(info) {
    this.infos[info.id] = info;

    info.onDestroy(id => {
      this.destroyQueue.add(id);
    });
  }

  update(time) {
    this.forEachInfo(info => {
      info.update(time);
    });

    this.destroyQueue.forEachQueue(id => {
      delete this.infos[id];
    });

    this.destroyQueue.reset();
  }

  countdownExists() {
    return "countdown" in this.infos;
  }

  clearCountdown() {
    delete this.infos.countdown;
  }

  forEachInfo(callback) {
    _.each(this.infos, info => {
      callback(info);
    });
  }

  generateId(time, info, x, y) {
    return `${time}${Math.abs(info)}${x}${y}`;
  }
}

export default Info;
