define(["./container/container"], (Container) => {
  return class {
    constructor(game, intrface) {
      this.game = game;
      this.player = game.player;

      this.health = $("#health");
      this.healthBar = $("#healthBar");
      this.healthBarText = $("#healthBarText");

      this.exp = $("#exp");
      this.expBar = $("#expBar");

      this.load();
    }

    load() {
      this.player.onHitPoints(() => {
        this.calculateHealthBar();
      });

      this.player.onMaxHitPoints(() => {
        this.calculateHealthBar();
      });

      this.player.onExperience(() => {
        this.calculateExpBar();
      });
    }

    calculateHealthBar() {
      const scale = this.getScale();
      const width = this.healthBar.width();

      // 11 is due to the offset of the #health in the #healthBar
      let diff = Math.floor(
        width * (this.player.hitPoints / this.player.maxHitPoints) - 11 * scale
      );
      const prevWidth = this.health.width();

      if (this.player.poison) {
        this.toggle("poison");
      } else {
        this.toggle(diff - 1 > prevWidth ? "green" : "white");
      }

      if (diff > width) {
        diff = width;
      }

      this.health.css("width", diff + "px");
      this.healthBarText.text(
        this.player.hitPoints + "/" + this.player.maxHitPoints
      );
    }

    calculateExpBar() {
      const scale = this.getScale();
      const width = this.expBar.width();

      const experience = this.player.experience - this.player.prevExperience;
      const nextExperience =
        this.player.nextExperience - this.player.prevExperience;
      const diff = Math.floor(width * (experience / nextExperience));

      this.exp.css("width", diff + "px");
    }

    resize() {
      this.calculateHealthBar();
      this.calculateExpBar();
    }

    getScale() {
      let scale = this.game.app.getUIScale();

      if (scale < 2) {
        scale = 2;
      }

      return scale;
    }

    toggle(tClass) {
      this.health.addClass(tClass);

      setTimeout(() => {
        this.health.removeClass(tClass);
      }, 500);
    }
  };
});
