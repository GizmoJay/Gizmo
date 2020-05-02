/* global _, log */

define(() => {
  return class {
    constructor(intrface) {
      this.interface = intrface;

      this.body = $("#actionContainer");
      this.drop = $("#dropDialog");
      this.dropInput = $("#dropCount");

      this.activeClass = null;

      this.miscButton = null;

      this.load();
    }

    load() {
      const dropAccept = $("#dropAccept");
      const dropCancel = $("#dropCancel");

      dropAccept.click(event => {
        if (this.activeClass === "inventory") {
          this.interface.inventory.clickAction(event);
        }
      });

      dropCancel.click(event => {
        if (this.activeClass === "inventory") {
          this.interface.inventory.clickAction(event);
        }
      });
    }

    loadDefaults(activeClass, data) {
      this.reset();
      this.activeClass = activeClass;

      if (data) {
        this.body.css({
          left: data.mouseX - this.body.width() / 2 + "px",
          top: data.mouseY + this.body.height() / 2 + "px"
        });
      }

      switch (this.activeClass) {
        case "inventory":
          this.body.css({
            bottom: "10%",
            left: "10%"
          });

          const dropButton = $(
            "<div id=\"drop\" class=\"actionButton\">Drop</div>"
          );

          this.add(dropButton);

          break;

        case "player":
          this.add(this.getFollowButton());

          if (data.pvp) {
            this.add(this.getAttackButton());
          }

          break;

        case "mob":
          this.add(this.getFollowButton());
          this.add(this.getAttackButton());

          break;

        case "npc":
          this.add(this.getFollowButton());
          this.add(this.getTalkButton());

          break;

        case "object":
          log.info("[loadDefaults] object.");

          break;
      }
    }

    add(button, misc) {
      this.body.find("ul").prepend($("<li></li>").append(button));

      button.click(event => {
        if (this.activeClass === "inventory") {
          this.interface.inventory.clickAction(event);
        }
      });

      if (misc) {
        this.miscButton = button;
      }
    }

    removeMisc() {
      this.miscButton.remove();
      this.miscButton = null;
    }

    reset() {
      const buttons = this.getButtons();

      for (let i = 0; i < buttons.length; i++) {
        $(buttons[i]).remove();
      }
    }

    show() {
      this.body.fadeIn("fast");
    }

    hide() {
      this.body.fadeOut("slow");
    }

    clear() {
      $("#dropAccept").unbind("click");
      $("#dropCancel").unbind("click");

      this.trade.unbind("click");
      this.follow.unbind("click");
    }

    displayDrop(activeClass) {
      this.activeClass = activeClass;

      this.drop.fadeIn("fast");

      this.dropInput.focus();
      this.dropInput.select();
    }

    hideDrop() {
      this.drop.fadeOut("slow");

      this.dropInput.blur();
      this.dropInput.val("");
    }

    getAttackButton() {
      return $("<div id=\"attack\" class=\"actionButton\">Attack</div>");
    }

    getFollowButton() {
      return $("<div id=\"follow\" class=\"actionButton\">Follow</div>");
    }

    getTradeButton() {
      return $("<div id=\"trade\" class=\"actionButton\">Trade</div>");
    }

    getTalkButton() {
      return $("<div id=\"talkButton\" class=\"actionButton\">Talk</div>");
    }

    getButtons() {
      return this.body.find("ul").find("li");
    }

    getGame() {
      return this.interface.game;
    }

    getPlayer() {
      return this.interface.game.player;
    }

    isVisible() {
      return this.body.css("display") === "block";
    }
  };
});
