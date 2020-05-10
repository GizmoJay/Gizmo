import App from "../app";
const storage = window.localStorage;
const name = "data";

/**
 *
 *
 * @class Storage
 */
class Storage {
  /**
   * Creates an instance of Storage.
   *
   * @param {App} app
   *
   * @memberof Storage
   */
  constructor(app) {
    this.app = app;
    this.data = null;

    this.load();
  }

  load() {
    if (storage.data) {
      this.data = JSON.parse(storage.getItem(name));
    } else {
      this.data = this.create();
    }

    if (this.data.clientVersion !== this.app.config.version) {
      this.data = this.create();
      this.save();
    }
  }

  create() {
    return {
      new: true,
      clientVersion: this.app.config.version,

      player: {
        email: "",
        username: "",
        password: "",
        autoLogin: false,
        rememberMe: false,
        orientation: Modules.Orientation.Down
      },

      settings: {
        music: 100,
        sfx: 100,
        brightness: 100,
        soundEnabled: true,
        FPSCap: true,
        centerCamera: true,
        debug: false,
        showNames: true,
        showLevels: true
      },

      map: {
        regionData: [],
        collisions: [],
        objects: [],
        cursorTiles: {}
      }
    };
  }

  save() {
    if (this.data) {
      storage.setItem(name, JSON.stringify(this.data));
    }
  }

  clear() {
    storage.removeItem(name);
    this.data = this.create();
  }

  toggleRemember(toggle) {
    this.data.player.rememberMe = toggle;
    this.save();
  }

  setOrientation(orientation) {
    const player = this.getPlayer();

    player.orientation = orientation;

    this.save();
  }

  setPlayer(option, value) {
    const pData = this.getPlayer();

    if (Object.prototype.hasOwnProperty.call(pData, option)) {
      pData[option] = value;
    }

    this.save();
  }

  setSettings(option, value) {
    const sData = this.getSettings();

    if (Object.prototype.hasOwnProperty.call(sData, option)) {
      sData[option] = value;
    }

    this.save();
  }

  setRegionData(regionData, collisionData, objects, cursorTiles) {
    this.data.map.regionData = regionData;
    this.data.map.collisions = collisionData;
    this.data.map.objects = objects;
    this.data.map.cursorTiles = cursorTiles;

    this.save();
  }

  getPlayer() {
    return this.data.player;
  }

  getSettings() {
    return this.data ? this.data.settings : null;
  }

  getRegionData() {
    return this.data.map.regionData;
  }

  getCollisions() {
    return this.data.map.collisions;
  }

  getObjects() {
    return this.data.map.objects;
  }

  getCursorTiles() {
    return this.data.map.cursorTiles;
  }
}

export default Storage;
