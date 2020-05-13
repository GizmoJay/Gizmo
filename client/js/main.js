import App from "./app";
import Game from "./game";
import "./lib/modernizr.js";

let app, body, chatInput, game;

const addClasses = () => {
  if (Detect.isWindows()) body.addClass("windows");

  if (Detect.isOpera()) body.addClass("opera");

  if (Detect.isFirefoxAndroid()) chatInput.removeAttr("placeholder");
};

const initGame = () => {
  app.sendStatus("Loading game");

  if (app.config.debug) log.info("Loading the main application...");
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
