import Game from "../game";
import Animation from "../entity/animation";
import Chat from "./chat";
import Overlay from "./overlay";

/**
 * @class Input
 */
class Input {
  /**
   * Creates an instance of Input.
   *
   * @param {Game} game
   *
   * @memberof Input
   */
  constructor(game) {
    this.game = game;
    this.app = game.app;
    this.renderer = game.renderer;
    this.map = game.map;

    this.selectedCellVisible = false;
    this.previousClick = {};
    this.cursorVisible = true;
    this.targetVisible = true;
    this.selectedX = -1;
    this.selectedY = -1;

    this.cursor = null;
    this.newCursor = null;

    this.targetData = null;
    this.targetColor = null;
    this.newTargetColor = null;
    this.mobileTargetColor = "rgba(51, 255, 0)";

    this.keyMovement = true;
    this.cursorMoved = false;

    this.previousKey = {};

    this.cursors = {};

    this.lastMousePosition = { x: 0, y: 0 };

    this.hovering = null;
    this.hoveringEntity = null; // for debugging

    this.mouse = {
      x: 0,
      y: 0
    };

    this.load();
  }

  load() {
    /**
     * This is the animation for the target
     * cell spinner sprite (only on desktop)
     */

    this.targetAnimation = new Animation("move", 4, 0, 32, 32);
    this.targetAnimation.setSpeed(50);

    this.chatHandler = new Chat(this.game);
    this.overlay = new Overlay(this);
  }

  loadCursors() {
    this.cursors.hand = this.game.getSprite("hand");
    this.cursors.sword = this.game.getSprite("sword");
    this.cursors.loot = this.game.getSprite("loot");
    this.cursors.target = this.game.getSprite("target");
    this.cursors.arrow = this.game.getSprite("arrow");
    this.cursors.talk = this.game.getSprite("talk");
    this.cursors.spell = this.game.getSprite("spell");
    this.cursors.bow = this.game.getSprite("bow");

    this.newCursor = this.cursors.hand;
    this.newTargetColor = "rgba(255, 255, 255, 0.5)";

    if (this.game.isDebug()) {
      log.info("Loaded Cursors!");
    }
  }

  handle(inputType, data) {
    const player = this.getPlayer();

    switch (inputType) {
      case Modules.InputType.Key:
        if (this.chatHandler.isActive()) {
          this.chatHandler.key(data);
          return;
        }

        switch (data) {
          case Modules.Keys.W:
          case Modules.Keys.Up:
            player.moveUp = true;

            break;

          case Modules.Keys.A:
          case Modules.Keys.Left:
            player.moveLeft = true;

            break;

          case Modules.Keys.S:
          case Modules.Keys.Down:
            player.moveDown = true;

            break;

          case Modules.Keys.D:
          case Modules.Keys.Right:
            player.moveRight = true;

            break;

          case Modules.Keys.Spacebar:
            if (player.moving) {
              break;
            }

            if (!player.isRanged()) {
              break;
            }

            player.frozen = true;

            this.updateFrozen(player.frozen);

            break;

          case Modules.Keys.Slash:
            this.chatHandler.input.val("/");

          // eslint-disable-next-line no-fallthrough
          case Modules.Keys.T:
          case Modules.Keys.Enter:
            this.chatHandler.toggle();

            break;

          case Modules.Keys.I:
            this.game.interface.inventory.open();

            break;

          case Modules.Keys.M:
            this.game.interface.warp.open();

            break;

          case Modules.Keys.P:
            this.game.interface.profile.open();

            break;

          case Modules.Keys.Esc:
            this.game.interface.profile.settings.open();

            break;
        }

        break;

      case Modules.InputType.LeftClick:
        player.disableAction = false;
        this.keyMovement = false;
        this.setCoords(data);

        if (window.event.ctrlKey) {
          log.info("Control key is pressed lmao");

          this.game.socket.send(Packets.Command, [
            Packets.CommandOpcode.CtrlClick,
            this.getCoords()
          ]);
          return;
        }

        this.leftClick(this.getCoords());

        break;

      case Modules.InputType.RightClick:
        this.rightClick(this.getCoords());

        break;
    }
  }

  keyUp(key) {
    const player = this.getPlayer();

    switch (key) {
      case Modules.Keys.W:
      case Modules.Keys.Up:
        player.moveUp = false;

        break;

      case Modules.Keys.A:
      case Modules.Keys.Left:
        player.moveLeft = false;

        break;

      case Modules.Keys.S:
      case Modules.Keys.Down:
        player.moveDown = false;

        break;

      case Modules.Keys.D:
      case Modules.Keys.Right:
        player.moveRight = false;

        break;

      case Modules.Keys.Spacebar:
        if (player.moving) {
          break;
        }

        if (!player.isRanged()) {
          break;
        }

        player.frozen = false;

        this.updateFrozen(player.frozen);

        break;
    }

    player.disableAction = false;
  }

  keyMove(position) {
    const player = this.getPlayer();

    if (!player.hasPath()) {
      this.keyMovement = true;
      this.cursorMoved = false;

      if (this.game.isDebug()) {
        log.info("--- keyMove ---");
        log.info(position);
        log.info("---------------");
      }

      this.leftClick(position);
    }
  }

  leftClick(position) {
    const player = this.getPlayer();

    if (player.stunned) {
      return;
    }

    this.setPassiveTarget();

    /**
     * It can be really annoying having the chat open
     * on mobile, and it is far harder to control.
     */

    if (
      this.renderer.mobile &&
      this.chatHandler.input.is(":visible") &&
      this.chatHandler.input.val() === ""
    ) {
      this.chatHandler.hideInput();
    }

    if (this.map.isOutOfBounds(position.x, position.y)) {
      return;
    }

    if (
      (this.game.zoning && this.game.zoning.direction) ||
      player.disableAction
    ) {
      return;
    }

    if (this.game.interface) {
      this.game.interface.hideAll();
    }

    if (this.map.isObject(position.x, position.y)) {
      player.setObjectTarget(position.x, position.y);
      player.followPosition(position.x, position.y);

      return;
    }

    if (this.renderer.mobile) {
      this.entity = this.game.getEntityAt(
        position.x,
        position.y,
        position.x === player.gridX && position.y === player.gridY
      );
    }

    if (this.entity) {
      player.disableAction = true;

      this.setAttackTarget();

      if (this.isTargetable(this.entity)) {
        player.setTarget(this.entity);
      }

      if (
        player.getDistance(this.entity) < 7 &&
        player.isRanged() &&
        this.isAttackable(this.entity)
      ) {
        this.game.socket.send(Packets.Target, [
          Packets.TargetOpcode.Attack,
          this.entity.id
        ]);
        player.lookAt(this.entity);
        return;
      }

      if (
        this.entity.gridX === player.gridX &&
        this.entity.gridY === player.gridY
      ) {
        this.game.socket.send(Packets.Target, [
          Packets.TargetOpcode.Attack,
          this.entity.id
        ]);
      }

      if (this.isTargetable(this.entity)) {
        player.follow(this.entity);
        return;
      }
    }

    player.go(position.x, position.y);
  }

  rightClick(position) {
    if (this.renderer.mobile) {
      this.entity = this.game.getEntityAt(
        position.x,
        position.y,
        this.isSamePosition(position)
      );
    }

    if (this.entity) {
      const actions = this.getActions();

      actions.loadDefaults(this.entity.type, {
        mouseX: this.mouse.x,
        mouseY: this.mouse.y,
        pvp: this.entity.pvp
      });

      actions.show();
    } else if (this.hovering === Modules.Hovering.Object) {
      // TODO
    }
  }

  updateCursor() {
    if (!this.cursorVisible) {
      return;
    }

    if (this.newCursor !== this.cursor) {
      this.cursor = this.newCursor;
    }

    if (this.newTargetColor !== this.targetColor) {
      this.targetColor = this.newTargetColor;
    }
  }

  moveCursor() {
    if (!this.renderer || this.renderer.mobile || !this.renderer.camera) {
      return;
    }

    const position = this.getCoords();
    const player = this.getPlayer();

    // The entity we are currently hovering over.
    this.entity = this.game.getEntityAt(
      position.x,
      position.y,
      this.isSamePosition(position)
    );

    this.overlay.update(this.entity);

    if (!this.entity || this.entity.id === player.id) {
      if (this.map.isObject(position.x, position.y)) {
        this.setCursor(this.cursors.talk);
        this.hovering = Modules.Hovering.Object;
      } else {
        this.setCursor(this.cursors.hand);
        this.hovering = null;
      }
    } else {
      switch (this.entity.type) {
        case "item":
        case "chest":
          this.setCursor(this.cursors.loot);
          this.hovering = Modules.Hovering.Item;
          break;

        case "mob":
          this.setCursor(this.getAttackCursor());
          this.hovering = Modules.Hovering.Mob;
          break;

        case "npc":
          this.setCursor(this.cursors.talk);
          this.hovering = Modules.Hovering.NPC;
          break;

        case "player":
          if (this.entity.pvp && this.game.pvp) {
            this.setCursor(this.getAttackCursor());
            this.hovering = Modules.Hovering.Player;
          }

          break;
      }
    }
  }

  setPosition(x, y) {
    this.selectedX = x;
    this.selectedY = y;
  }

  setCoords(event) {
    const offset = this.app.canvas.offset();
    const width = this.renderer.background.width;
    const height = this.renderer.background.height;

    this.cursorMoved = false;

    this.mouse.x = Math.round(event.pageX - offset.left);
    this.mouse.y = Math.round(event.pageY - offset.top);

    if (this.mouse.x >= width) {
      this.mouse.x = width - 1;
    } else if (this.mouse.x <= 0) {
      this.mouse.x = 0;
    }

    if (this.mouse.y >= height) {
      this.mouse.y = height - 1;
    } else if (this.mouse.y <= 0) {
      this.mouse.y = 0;
    }
  }

  setCursor(cursor) {
    cursor
      ? (this.newCursor = cursor)
      : log.error(`Cursor: ${cursor} could not be found.`);
  }

  setAttackTarget() {
    this.targetAnimation.setRow(1);
    this.mobileTargetColor = "rgb(255, 51, 0)";
  }

  setPassiveTarget() {
    this.targetAnimation.setRow(0);
    this.mobileTargetColor = "rgb(51, 255, 0)";
  }

  getAttackCursor() {
    return this.cursors[this.getPlayer().isRanged() ? "bow" : "sword"];
  }

  getCoords() {
    if (!this.renderer || !this.renderer.camera) {
      return;
    }

    const tileScale = this.renderer.tileSize * this.renderer.getSuperScaling();
    const offsetX = this.mouse.x % tileScale;
    const offsetY = this.mouse.y % tileScale;
    const x =
      (this.mouse.x - offsetX) / tileScale + this.game.getCamera().gridX;
    const y =
      (this.mouse.y - offsetY) / tileScale + this.game.getCamera().gridY;

    return {
      x: x,
      y: y
    };
  }

  getTargetData() {
    const frame = this.targetAnimation.currentFrame;
    const superScale = this.renderer.getSuperScaling();
    const sprite = this.game.getSprite("target");

    if (!sprite.loaded) {
      sprite.load();
    }

    return (this.targetData = {
      sprite: sprite,
      x: frame.x * superScale,
      y: frame.y * superScale,
      width: sprite.width * superScale,
      height: sprite.height * superScale,
      dx: this.selectedX * 32 * superScale,
      dy: this.selectedY * 32 * superScale,
      dw: sprite.width * superScale,
      dh: sprite.height * superScale
    });
  }

  updateFrozen(state) {
    this.game.socket.send(Packets.Movement, [
      Packets.MovementOpcode.Freeze,
      state
    ]);
  }

  isTargetable(entity) {
    return (
      this.isAttackable(entity) ||
      entity.type === "npc" ||
      entity.type === "chest"
    );
  }

  isAttackable(entity) {
    return (
      entity.type === "mob" ||
      (entity.type === "player" && entity.pvp && this.game.pvp)
    );
  }

  isSamePosition(position) {
    return (
      position.x === this.game.player.gridX &&
      position.y === this.game.player.gridY
    );
  }

  getPlayer() {
    return this.game.player;
  }

  getActions() {
    return this.game.interface.actions;
  }
}

export default Input;
