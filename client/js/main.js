import App from "./app";
import Game from "./game";
import "./lib/modernizr";

/**
 * @type {App}
 */
let app;
/**
 * @type {Game}
 */
let game;
/**
 * @type {JQuery<HTMLBodyElement>}
 */
let body;
/**
 * @type {JQuery<HTMLInputElement>}
 */
let chatInput;

const addClasses = () => {
  if (Detect.isWindows()) body.addClass("windows");

  if (Detect.isOpera()) body.addClass("opera");

  if (Detect.isFirefoxAndroid()) chatInput.removeAttr("placeholder");
};

const initGame = () => {
  app.sendStatus("Loading game");

  if (app.config.debug) {
    log.info("Loading the main application...");

    if (module?.hot) {
      module.hot.accept();
    }
  }

  if (app.config.worldSwitch) $("#worlds-switch").show();

  game = new Game(app);
  app.setGame(game);
};

$(document).ready(() => {
  app = new App();
  body = $("body");
  chatInput = $("#chatInput");

  addClasses();
  initGame();
});
