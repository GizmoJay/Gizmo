/* global log, Class, Detect, Modules */
import install from "../lib/pwa";
import config from "../data/config.json";

/**
 * @class App
 */
class App {
  /**
   * Creates an instance of App.
   *
   * @memberof App
   */
  constructor() {
    this.config = null;

    this.body = $("body");
    this.parchment = $("#parchment");
    this.container = $("#container");
    this.window = $(window);
    this.canvas = $("#canvas");
    this.border = $("#border");

    this.intro = $("#intro");

    this.loginButton = $("#login");
    this.createButton = $("#play");
    this.registerButton = $("#newCharacter");
    this.helpButton = $("#helpButton");
    this.cancelButton = $("#cancelButton");
    this.yes = $("#yes");
    this.no = $("#no");
    this.loading = $(".loader");

    this.respawn = $("#respawn");

    this.rememberMe = $("#rememberMe");

    this.about = $("#toggle-about");
    // this.credits = $("#toggle-credits");
    this.discord = $("#toggle-discord");
    this.git = $("#toggle-git");

    this.footer = $("footer");

    this.loginFields = [];
    this.registerFields = [];

    this.game = null;
    this.config = config;
    this.parchmentAnimating = false;
    this.loggingIn = false;

    this.sendStatus("Initializing the main app");

    this.updateOrientation();
    this.load();
  }

  load() {
    this.loginButton.click(() => {
      this.login();
    });

    this.createButton.click(() => {
      this.login();
    });

    this.registerButton.click(() => {
      this.openScroll("loadCharacter", "createCharacter");
    });

    this.cancelButton.click(() => {
      this.openScroll("createCharacter", "loadCharacter");
    });

    this.parchment.click(() => {
      if (
        this.parchment.hasClass("about") ||
        // this.parchment.hasClass("credits") ||
        this.parchment.hasClass("git")
      ) {
        this.parchment.removeClass("about git"); // credits
        this.displayScroll("loadCharacter");
      }
    });

    this.about.click(() => {
      this.displayScroll("about");
    });

    // this.credits.click(() => {
    //   this.displayScroll("credits");
    // });

    this.discord.click(() => {
      window.open("https://discord.gg/hFPzybb");
    });

    this.git.click(() => {
      this.displayScroll("git");
    });

    this.rememberMe.click(() => {
      if (!this.game || !this.game.storage) {
        return;
      }

      const active = this.rememberMe.hasClass("active");

      this.rememberMe.toggleClass("active");

      this.game.storage.toggleRemember(!active);
    });

    this.respawn.click(() => {
      if (!this.game || !this.game.player || !this.game.player.dead) {
        return;
      }

      this.game.respawn();
    });

    window.scrollTo(0, 1);

    this.window.resize(() => {
      if (this.game) {
        this.game.resize();
      }
    });

    //  // Default Server ID
    //  if (!window.localStorage.getItem("world")) {
    //    window.localStorage.setItem("world", "gizmo_server01");
    //  }

    // $.get("https://hub.gizmo.com/all", (servers) => {
    //   let serverIndex;
    //   for (let i = 0; i < servers.length; i++) {
    //     const server = servers[i];

    //     const row = $(document.createElement("tr"));
    //     row.append($(document.createElement("td")).text(server.serverId));
    //     row.append(
    //       $(document.createElement("td")).text(
    //         server.playerCount + "/" + server.maxPlayers
    //       )
    //     );
    //     $("#worlds-list").append(row);
    //     row.click(() => {
    //       // TODO: This is when a server is clicked with the local `server` having the world data.
    //       // log.info(server);
    //     });

    //     if (server.serverId === window.localStorage.getItem("world")) {
    //       serverIndex = i;
    //     }
    //   }
    //   const currentWorld = servers[serverIndex];

    //   $("#current-world-index").text(serverIndex);
    //   $("#current-world-id").text(currentWorld.serverId);
    //   $("#current-world-count").text(
    //     currentWorld.playerCount + "/" + currentWorld.maxPlayers
    //   );

    //   $("#worlds-switch").click(() => {
    //     $("#worlds-popup").toggle();
    //   });
    // });

    $(document).bind("keydown", e => {
      if (e.which === Modules.Keys.Enter) {
        return false;
      }
    });

    $(document).keydown(e => {
      const key = e.which || e.keyCode || 0;

      if (!this.game) {
        return;
      }

      this.body.focus();

      if (!this.game.started) {
        switch (key) {
          case Modules.Keys.Enter:
            this.login();
            return;

          case Modules.Keys.Spacebar:
            if (!$("input:focus")[0]) {
              this.rememberMe.click();
            }
            break;
        }
      }

      if (this.game.started) {
        this.game.handleInput(Modules.InputType.Key, key);
      }
    });

    $(document).keyup(e => {
      const key = e.which;

      if (!this.game || !this.game.started) {
        return;
      }

      this.game.input.keyUp(key);
    });

    $(document).mousemove(event => {
      if (
        !this.game ||
        !this.game.input ||
        !this.game.started ||
        event.target.id !== "textCanvas"
      ) {
        return;
      }

      this.game.input.setCoords(event);
      this.game.input.moveCursor();
    });

    $("body").on("contextmenu", "#canvas", event => {
      if (this.game && this.game.input) {
        this.game.input.handle(Modules.InputType.RightClick, event);
      }

      return false;
    });

    this.canvas.click(event => {
      if (!this.game || !this.game.started || event.button !== 0) {
        return;
      }

      window.scrollTo(0, 1);

      this.game.input.handle(Modules.InputType.LeftClick, event);
    });

    $("input[type=\"range\"]").on("input", () => {
      this.updateRange($(this));
    });
  }

  login() {
    if (
      this.loggingIn ||
      !this.game ||
      !this.game.loaded ||
      this.statusMessage ||
      !this.verifyForm()
    ) {
      return;
    }

    this.container.css("visibility", "visible");
    this.toggleLogin(true);
    this.game.connect();

    install(); // $("pwa-install")[0].openPrompt();
  }

  fadeMenu() {
    this.updateLoader(null);

    setTimeout(() => {
      this.body.addClass("game");
      this.body.addClass("started");

      this.body.removeClass("intro");

      this.footer.hide();
    }, 500);
  }

  showMenu() {
    this.body.removeClass("game");
    this.body.removeClass("started");
    this.body.addClass("intro");

    this.footer.show();
  }

  showDeath() {}

  openScroll(origin, destination) {
    if (!destination || this.loggingIn) {
      return;
    }

    this.cleanErrors();

    if (!Detect.isMobile()) {
      if (this.parchmentAnimating) {
        return;
      }

      this.parchmentAnimating = true;

      this.parchment.toggleClass("animate").removeClass(origin);

      setTimeout(
        () => {
          this.parchment.toggleClass("animate").addClass(destination);
          this.parchmentAnimating = false;
        },
        Detect.isTablet() ? 0 : 1000
      );
    } else {
      this.parchment.removeClass(origin).addClass(destination);
    }
  }

  displayScroll(content) {
    const state = this.parchment.attr("class");

    if (this.game.started) {
      this.parchment.removeClass().addClass(content);

      this.body.removeClass("legal about").toggleClass(content); // credits

      if (this.game.player) {
        this.body.toggleClass("death");
      }

      if (content !== "about") {
        this.helpButton.removeClass("active");
      }
    } else if (state !== "animate") {
      this.openScroll(state, state === content ? "loadCharacter" : content);
    }
  }

  verifyForm() {
    const activeForm = this.getActiveForm();

    if (activeForm === "null") {
      return;
    }

    switch (activeForm) {
      case "loadCharacter": {
        const emailInput = $("#loginEmailInput");
        const passwordInput = $("#loginPasswordInput");

        if (this.loginFields.length === 0) {
          this.loginFields = [emailInput, passwordInput];
        }

        if (!emailInput.val()) {
          this.sendError(emailInput, "Please enter a email.");
          return false;
        }

        if (!passwordInput.val()) {
          this.sendError(passwordInput, "Please enter a password.");
          return false;
        }

        break;
      }

      case "createCharacter": {
        const email = $("#registerEmailInput");
        const registerPassword = $("#registerPasswordInput");
        const registerPasswordConfirmation = $(
          "#registerPasswordConfirmationInput"
        );

        if (this.registerFields.length === 0) {
          this.registerFields = [
            email,
            registerPassword,
            registerPasswordConfirmation
          ];
        }

        if (!email.val() || !this.verifyEmail(email.val())) {
          this.sendError(email, "An email is required!");
          return false;
        }

        if (!registerPassword.val()) {
          this.sendError(registerPassword, "You must enter a password.");
          return false;
        }

        if (registerPasswordConfirmation.val() !== registerPassword.val()) {
          this.sendError(
            registerPasswordConfirmation,
            "The passwords do not match!"
          );
          return false;
        }

        break;
      }
    }

    return true;
  }

  verifyEmail(email) {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  }

  sendStatus(message) {
    this.cleanErrors();

    this.statusMessage = message;

    if (!message) {
      return;
    }

    $("<span></span>", {
      class: "status blink",
      text: message
    }).appendTo(".validation-summary");

    $(".status").append(
      "<span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span>"
    );
  }

  sendError(field, error) {
    this.cleanErrors();

    $("<span></span>", {
      class: "validation-error blink",
      text: error
    }).appendTo(".validation-summary");

    if (!field) {
      return;
    }

    field.addClass("field-error").select();
    field.bind("keypress", event => {
      field.removeClass("field-error");

      $(".validation-error").remove();

      $(this).unbind(event);
    });
  }

  cleanErrors() {
    const activeForm = this.getActiveForm();
    const fields =
      activeForm === "loadCharacter" ? this.loginFields : this.registerFields;

    for (let i = 0; i < fields.length; i++) {
      fields[i].removeClass("field-error");
    }

    $(".validation-error").remove();
    $(".status").remove();
  }

  getActiveForm() {
    return this.parchment[0].className;
  }

  isRegistering() {
    return this.getActiveForm() === "createCharacter";
  }

  setGame(game) {
    this.game = game;
  }

  hasWorker() {
    return !!window.Worker;
  }

  getScaleFactor() {
    return 3;
  }

  getUIScale() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return width <= 1000 ? 1 : width <= 1500 || height <= 870 ? 2 : 3;
  }

  revertLoader() {
    this.updateLoader("Connecting");
  }

  updateLoader(message) {
    if (!message) {
      this.loading.html("");
      return;
    }

    const dots =
      "<span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span><span class=\"loader__dot\">.</span>";
    this.loading.html(message + dots);
  }

  toggleLogin(toggle) {
    this.revertLoader();

    this.toggleTyping(toggle);

    this.loggingIn = toggle;

    if (toggle) {
      this.loading.removeAttr("hidden");

      this.loginButton.addClass("disabled");
      this.registerButton.addClass("disabled");
    } else {
      this.loading.attr("hidden", true);

      this.loginButton.removeClass("disabled");
      this.registerButton.removeClass("disabled");
    }
  }

  toggleTyping(state) {
    if (this.loginFields) {
      _.each(this.loginFields, field => {
        field.prop("readonly", state);
      });
    }

    if (this.registerFields) {
      _.each(this.registerFields, field => {
        field.prop("readOnly", state);
      });
    }
  }

  updateRange(obj) {
    const val =
      (obj.val() - obj.attr("min")) / (obj.attr("max") - obj.attr("min"));

    obj.css(
      "background-image",
      `-webkit-gradient(linear, left top, right top, color-stop(${val}, #4d4d4d), color-stop(${val}, #C5C5C5))`
    );
  }

  updateOrientation() {
    this.orientation = this.getOrientation();
  }

  getOrientation() {
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }
}

export default App;
