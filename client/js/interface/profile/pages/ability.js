define(["../page"], Page => {
  return class Ability extends Page {
    constructor(game) {
      super("#skillPage");

      this.game = game;
    }
  };
});
