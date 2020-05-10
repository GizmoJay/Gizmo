import Map from "../map/map";

/**
 *
 *
 * @class Grids
 */
class Grids {
  /**
   * Creates an instance of Grids.
   *
   * @param {Map} map
   *
   * @memberof Grids
   */
  constructor(map) {
    this.map = map;

    this.renderingGrid = [];
    this.pathingGrid = [];
    this.itemGrid = [];

    this.load();
  }

  load() {
    for (let i = 0; i < this.map.height; i++) {
      this.renderingGrid[i] = [];
      this.pathingGrid[i] = [];
      this.itemGrid[i] = [];

      for (let j = 0; j < this.map.width; j++) {
        this.renderingGrid[i][j] = {};
        this.pathingGrid[i][j] = this.map.grid[i][j];
        this.itemGrid[i][j] = {};
      }
    }

    if (this.map.game.isDebug()) {
      log.info("Finished generating grids.");
    }
  }

  resetPathingGrid() {
    this.pathingGrid = [];

    for (let i = 0; i < this.map.height; i++) {
      this.pathingGrid[i] = [];

      for (let j = 0; j < this.map.width; j++) {
        this.pathingGrid[i][j] = this.map.grid[i][j];
      }
    }
  }

  addToRenderingGrid(entity, x, y) {
    if (!this.map.isOutOfBounds(x, y)) {
      this.renderingGrid[y][x][entity.id] = entity;
    }
  }

  addToPathingGrid(x, y) {
    this.pathingGrid[y][x] = 1;
  }

  addToItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x]) {
      this.itemGrid[y][x][item.id] = item;
    }
  }

  removeFromRenderingGrid(entity, x, y) {
    if (
      entity &&
      this.renderingGrid[y][x] &&
      entity.id in this.renderingGrid[y][x]
    ) {
      delete this.renderingGrid[y][x][entity.id];
    }
  }

  removeFromPathingGrid(x, y) {
    this.pathingGrid[y][x] = 0;
  }

  removeFromMapGrid(x, y) {
    this.map.grid[y][x] = 0;
  }

  removeFromItemGrid(item, x, y) {
    if (item && this.itemGrid[y][x][item.id]) {
      delete this.itemGrid[y][x][item.id];
    }
  }

  removeEntity(entity) {
    if (entity) {
      this.removeFromPathingGrid(entity.gridX, entity.gridY);
      this.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);

      if (entity.nextGridX > -1 && entity.nextGridY > -1) {
        this.removeFromPathingGrid(entity.nextGridX, entity.nextGridY);
      }
    }
  }
}

export default Grids;
