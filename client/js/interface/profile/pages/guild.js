define(["../page"], Page => {
  return class Guild extends Page {
    constructor(game) {
      super("#guildPage");

      this.game = game;
    }
  };
});
