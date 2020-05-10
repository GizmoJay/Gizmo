# Gizmo

Gizmo Game Engine Description.

## Table of Contents

- [Gizmo](#gizmo)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Regions](#regions)
    - [Tilemap](#tilemap)
  - [Get Started](#get-started)
    - [Prerequisites](#prerequisites)
      - [NOTE: MongoDB](#note-mongodb)
    - [Installing and Running](#installing-and-running)
  - [Deployment](#deployment)
  - [Map Parsing](#map-parsing)
  - [TODO](#todo)
    - [Gameplay](#gameplay)
    - [Codebase Development](#codebase-development)
    - [Miscellaneous](#miscellaneous)
  - [License](#license)

## Features

BQ was intended as an experiment to showcase HTML5 capabilities, since then,
technology has only served to advance. Gizmo contains a lot of ideas and
features that build on top of its predecessor, a couple is:

- Multiplayer using [Socket.IO](https://socket.io)

- Enhanced rendering engine (includes dynamic lighting, overlays, animated
  tiles)

- Region system (client receives only necessary data and saves it)

- Questing and achievements system.

- Plugin-based combat system (for bosses/special enemies)

- And much more

### Regions

The region system sends data to the client according to the map data of the
server. The collisions are checked both server-side and client-side to avoid
cheating. The region system makes use of dynamic tiles, which are unlocked
according to a player's progress. Furthermore, there is integrated support for
instance, where we can use a section of the map (or clone it) and reuse it for
certain groups of players. The instancing is perfect for activities such as
minigames, where we will want to run multiple instances in parallel.

### Tilemap

Gizmo is built with modularity in mind, as such, the client supports multiple
tileset parsing. The tilemap can easily be constructed using
[Tiled Map Editor](https://www.mapeditor.org/). Using our map parsing tool
located in [`tools/map/exportmap.js`](tools/map/exportmap.js) you can easily
export your creation to both the client and the server.

## Get Started

### Prerequisites

You must first [install Node.js](https://nodejs.org/en/download/) to run the
server, and [install MongoDB](https://www.mongodb.com/download-center/community)
database to store user data.

#### NOTE: MongoDB

> MongoDB is a requirement for Gizmo to run with all the features enabled, but
> you can still run your own limited version if you do not want to install
> MongoDB. To do this, set `Config.offlineMode = true` in the server
> configuration. _If you do choose to install MongoDB, a user is not necessary,
> but you can enable authentication with the `Config.mongoAuth` variable in the
> [server configuration](server/config.js)._

After installing Node.js, install all packages by running

```console
npm install
```

### Installing and Running

Before starting Gizmo, there is some pre-configuration that must be done. Run

```console
npm run setup
```

this renames the client
configurations([`config.json-dist`](client/data/config.json-dist) to
[`config.json`](client/data/config.json)), and the server
configurations([`config.js-dist`](server/config.js-dist) to
[`config.js`](server/config.js)). Make sure the settings in the client match
those in the server. Modify the file accordingly to fit your needs.

```console
npm install
npm run build
npm start
```

## Deployment

You want to run this on your network or server? Well first, set the `host`name
and `port` of the server in the [server configuration](server/config.js) and
[client configuration](client/data/config.js) to match.

## Map Parsing

Once you finish modifying your map in [`tools/map/data`](tools/map/data) you can
parse the map data by executing [`exportmap.js`](tools/map/exportmap.js) in
[`tools/map`](tools/map) directory. Example command:

```console
npx node ./exportmap.js ./data/map.json
```

To build the current game map you can run

```console
npm run map
```

## TODO

### Gameplay

- Finalize the new map.

- Polish mob attributes.

- Have a consistent storyline that goes with the game.

- Implement special abilities and weapon perks.

- Improve anti-cheating detections.

- Add minigames

### Codebase Development

- Write documentation outlining the entirety of the source code.

### Miscellaneous

- Add (continue) to NPC talking &mdash; spacebar when talking

## License

This project is Unlicensed
