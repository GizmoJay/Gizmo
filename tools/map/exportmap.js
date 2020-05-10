#!/usr/bin/env node

config = { debugLevel: "all", debug: true };

const Log = require("../../server/js/util/log");
const processMap = require("./processmap");
const fs = require("fs");
_ = require("underscore");

log = new Log();

class ExportMap {
  constructor() {
    this.source = process.argv[2];

    if (!this.source) this.source = "data/main.json";

    fs.access(this.source, error => {
      if (error) {
        log.error(`The file ${source} could not be found.`, error);
        return;
      }

      fs.readFile(this.source, (error, file) => {
        if (error) log.error(`Could not read source file ${source}.`, error);

        this.handleMap(JSON.parse(file.toString()));
      });
    });
  }

  handleMap(data) {
    const worldClientJSON = "../../server/data/map/world_client.json";
    const worldServerJSON = "../../server/data/map/world_server.json";
    const clientMapJSON = "../../client/data/maps/map.json";

    const worldClient = this.parse(data, worldClientJSON, "client");

    this.parse(data, worldServerJSON, "server");
    this.parse(data, clientMapJSON, "info", worldClient);

    this.copyTilesets();
  }

  parse(data, destination, mode, worldClient) {
    const map = processMap(data, { mode: mode });

    if (worldClient) map.depth = worldClient.depth;

    const mapString = JSON.stringify(map);

    fs.writeFile(destination, mapString, (error, file) => {
      if (error) log.error("An error has occurred while writing map files.");
      else log.notice(`[${mode}] Map saved at: ${destination}`);
    });

    return map;
  }

  copyTilesets() {
    const source = "./data";
    const destination = "../../client/img/tilesets";

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

// String.prototype.format = function() {
//   return this.charAt(0).toUpperCase() + this.slice(1);
// };

// String.prototype.startsWith = function(str) {
//   return str.length > 0 && this.substring(0, str.length) === str;
// };

module.exports = ExportMap;

new ExportMap();
