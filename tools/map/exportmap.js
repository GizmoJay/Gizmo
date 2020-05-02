#!/usr/bin/env node

config = { debugLevel: "all", debug: true };

const Log = require("../../server/js/util/log");
const processMap = require("./processmap");
const fs = require("fs");
_ = require("underscore");

log = new Log();

class ExportMap {
  constructor() {
    const self = this;

    self.source = process.argv[2];

    if (!self.source) {
      self.source = "data/map-refactor.json";
    }

    fs.exists(self.source, exists => {
      if (!exists) {
        log.error(`The file ${source} could not be found.`);
        return;
      }

      fs.readFile(self.source, (error, file) => {
        self.handleMap(JSON.parse(file.toString()));
      });
    });
  }

  handleMap(data) {
    const self = this;
    const worldClientJSON = "../../server/data/map/world_client.json";
    const worldServerJSON = "../../server/data/map/world_server.json";
    const clientMapJSON = "../../client-dist/data/maps/map.json";
    const clientMapJS = "../../client-dist/data/maps/map.js";

    const worldClient = self.parse(data, worldClientJSON, "client");

    self.parse(data, worldServerJSON, "server");
    self.parse(data, clientMapJSON, "info", worldClient);
    self.parse(data, clientMapJS, "info", worldClient, true);

    self.copyTilesets();
  }

  parse(data, destination, mode, worldClient, isJS) {
    const self = this;
    const map = processMap(data, { mode: mode });

    if (worldClient) {
      map.depth = worldClient.depth;
    }

    let mapString = JSON.stringify(map);

    if (isJS) {
      mapString = "let mapData = " + mapString;
    }

    fs.writeFile(destination, mapString, (error, file) => {
      if (error) {
        log.error("An error has occurred while writing map files.");
      } else {
        log.notice(`[${mode.format()}] Map saved at: ${destination}`);
      }
    });

    return map;
  }

  copyTilesets() {
    const self = this;
    const source = "./data";
    const destination = "../../client-dist/img/tilesets";

    fs.readdir(source, (error, files) => {
      if (error) {
        log.error("Could not copy the tilesets...");
        return;
      }

      _.each(files, file => {
        if (file.startsWith("tilesheet-")) {
          fs.copyFileSync(`${source}/${file}`, `${destination}/${file}`);
        }
      });

      log.notice(`Finished copying tilesets to ${destination}/`);
    });
  }
}

String.prototype.format = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.startsWith = function(str) {
  return str.length > 0 && this.substring(0, str.length) === str;
};

module.exports = ExportMap;

new ExportMap();
