class Overlay {
  constructor(game) {
    this.game = game;

    this.overlays = {};
    this.currentOverlay = null;

    this.load();
  }

  load() {
    this.overlays["fog.png"] = this.loadOverlay("fog.png");
  }

  loadOverlay(overlayName) {
    const overlay = new Image();

    overlay.crossOrigin = "Anonymous";
    overlay.src = "img/overlays/" + overlayName;

    overlay.onload = () => {
      if (this.game.isDebug()) {
        log.info("Loaded " + overlayName);
      }
    };

    return overlay;
  }

  updateOverlay(overlay) {
    if (overlay in this.overlays) {
      this.currentOverlay = this.overlays[overlay];
    } else {
      this.currentOverlay = overlay;
    }
  }

  getFog() {
    return this.currentOverlay;
  }
}

export default Overlay;
