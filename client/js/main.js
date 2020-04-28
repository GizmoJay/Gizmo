/* global log, Detect */

// import App from "./app";
// import Game from "./game";

define(["./app", "./game"], (App, Game) => {
  let app, body, chatInput, game;

  const load = () => {
    $(document).ready(() => {
      app = new App();
      body = $("body");
      chatInput = $("#chatInput");

      addClasses();
      initGame();
    });
  };

  const addClasses = () => {
    if (Detect.isWindows()) body.addClass("windows");

    if (Detect.isOpera()) body.addClass("opera");

    if (Detect.isFirefoxAndroid()) chatInput.removeAttr("placeholder");
  };

  const initGame = () => {
    app.onReady(() => {
      app.sendStatus("Loading game");

      if (app.config.debug) log.info("Loading the main application...");
      if (app.config.worldSwitch) $("#worlds-switch").show();

      game = new Game(app);
      app.setGame(game);
    });
  };

  load();
});
