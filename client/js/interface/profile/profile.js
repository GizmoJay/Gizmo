import State from "./pages/state";
import Ability from "./pages/ability";
import Settings from "./pages/settings";
import Quest from "./pages/quest";
import Guild from "./pages/guild";
import Game from "../../game";

/**
 * @class Profile
 */
class Profile {
  /**
   * Creates an instance of Profile.
   *
   * @param {Game} game
   *
   * @memberof Profile
   */
  constructor(game) {
    this.game = game;

    this.body = $("#profileDialog");
    this.button = $("#profileButton");

    this.next = $("#next");
    this.previous = $("#previous");

    this.activePage = null;
    this.activeIndex = 0;
    this.pages = [];

    this.load();
  }

  load() {
    this.button.click(() => {
      this.open();
    });

    this.next.click(() => {
      if (this.activeIndex + 1 < this.pages.length) {
        this.setPage(this.activeIndex + 1);
      } else {
        this.next.removeClass("enabled");
      }
    });

    this.previous.click(() => {
      if (this.activeIndex > 0) {
        this.setPage(this.activeIndex - 1);
      } else {
        this.previous.removeClass("enabled");
      }
    });

    this.state = new State(this.game);
    this.ability = new Ability(this.game);
    this.settings = new Settings(this.game);
    this.quests = new Quest(this.game);
    this.guild = new Guild(this.game);

    this.pages.push(this.state, this.quests, this.guild, this.ability);

    this.activePage = this.state;

    if (this.activeIndex === 0 && this.activeIndex !== this.pages.length) {
      this.next.addClass("enabled");
    }
  }

  open() {
    this.game.interface.hideAll();
    this.settings.hide();

    if (this.isVisible()) {
      this.hide();
      this.button.removeClass("active");
    } else {
      this.show();
      this.button.addClass("active");
    }

    if (!this.activePage.loaded) {
      this.activePage.load();
    }

    this.game.socket.send(Packets.Click, [
      "profile",
      this.button.hasClass("active")
    ]);
  }

  update() {
    _.each(this.pages, page => {
      page.update();
    });
  }

  resize() {
    _.each(this.pages, page => {
      page.resize();
    });
  }

  setPage(index) {
    const page = this.pages[index];

    this.clear();

    if (page.isVisible()) {
      return;
    }

    this.activePage = page;
    this.activeIndex = index;

    if (this.activeIndex + 1 === this.pages.length) {
      this.next.removeClass("enabled");
    } else if (this.activeIndex === 0) {
      this.previous.removeClass("enabled");
    } else {
      this.previous.addClass("enabled");
      this.next.addClass("enabled");
    }

    page.show();
  }

  show() {
    this.body.fadeIn("slow");
    this.button.addClass("active");
  }

  hide() {
    this.body.fadeOut("fast");
    this.button.removeClass("active");

    if (this.settings) {
      this.settings.hide();
    }
  }

  clean() {
    this.button.unbind("click");
    this.next.unbind("click");
    this.previous.unbind("click");

    this.quests.clear();
    this.settings.clear();
    this.state.clear();
  }

  isVisible() {
    return this.body.css("display") === "block";
  }

  clear() {
    if (this.activePage) {
      this.activePage.hide();
    }
  }
}
export default Profile;
