import Container from "./container/container";

class Shop {
  constructor(game, intrface) {
    this.game = game;

    this.body = $("#shop");
    this.shop = $("#shopContainer");
    this.inventory = $("#shopInventorySlots");

    /**
     * sellSlot represents what the player currently has queued for sale
     * and sellSlotReturn shows the currency the player is receiving.
     * The reason for this is because shops are written such that
     * they can handle different currencies.
     */

    this.sellSlot = $("#shopSellSlot");
    this.sellSlotReturn = $("#shopSellSlotReturn");
    this.sellSlotReturnText = $("#shopSellSlotReturnText");

    this.confirmSell = $("#confirmSell");

    this.player = game.player;
    this.interface = intrface;

    this.container = null;
    this.data = null;

    this.openShop = -1;

    this.items = [];
    this.counts = [];

    this.close = $("#closeShop");

    this.close.css("left", "97%");
    this.close.click(() => {
      this.hide();
    });

    this.sellSlot.click(() => {
      this.remove();
    });

    this.confirmSell.click(() => {
      this.sell();
    });
  }

  buy(event) {
    const id = event.currentTarget.id.substring(11);

    this.game.socket.send(Packets.Shop, [
      Packets.ShopOpcode.Buy,
      this.openShop,
      id,
      1
    ]);
  }

  sell() {
    // The server will handle the selected item and verifications.
    this.game.socket.send(Packets.Shop, [
      Packets.ShopOpcode.Sell,
      this.openShop
    ]);
  }

  select(event) {
    const id = event.currentTarget.id.substring(17);

    this.game.socket.send(Packets.Shop, [
      Packets.ShopOpcode.Select,
      this.openShop,
      id
    ]);
  }

  remove() {
    this.game.socket.send(Packets.Shop, [Packets.ShopOpcode.Remove]);
  }

  move(info) {
    const inventorySlot = this.getInventoryList().find(
      "#shopInventorySlot" + info.slotId
    );
    const slotImage = inventorySlot.find("#inventoryImage" + info.slotId);
    const slotText = inventorySlot.find("#inventoryItemCount" + info.slotId);

    this.sellSlot.css({
      "background-image": slotImage.css("background-image"),
      "background-size": slotImage.css("background-size")
    });

    this.sellSlotReturn.css({
      "background-image": this.container.getImageFormat(
        this.getScale(),
        info.currency
      ),
      "background-size": this.sellSlot.css("background-size")
    });

    this.sellSlotReturnText.text(info.price);

    slotImage.css("background-image", "");
    slotText.text("");
  }

  moveBack(index) {
    const inventorySlot = this.getInventoryList().find(
      "#shopInventorySlot" + index
    );

    inventorySlot
      .find("#inventoryImage" + index)
      .css("background-image", this.sellSlot.css("background-image"));

    this.sellSlot.css("background-image", "");
    this.sellSlotReturn.css("background-image", "");
    this.sellSlotReturnText.text("");
  }

  /**
   * The shop file is already built to support full de-initialization of objects when
   * we receive an update about the stocks. So we just use that whenever we want to resize.
   * This is just a temporary fix, in reality, we do not want anyone to actually see the shop
   * do a full refresh when they buy an item or someone else buys an item.
   */

  resize() {
    this.getInventoryList().empty();
    this.getShopList().empty();

    this.update(this.data);
  }

  update(data) {
    this.reset();

    this.container = new Container(data.strings.length);

    // Update the global data to current revision
    this.data = data;

    this.load();
  }

  load() {
    for (let i = 0; i < this.container.size; i++) {
      const shopItem = $("<div id=\"shopItem" + i + "\" class=\"shopItem\"></div>");
      const string = this.data.strings[i];
      const name = this.data.names[i];
      const count = this.data.counts[i];
      const price = this.data.prices[i];

      if (!string || !name || !count) {
        continue;
      }

      const itemImage = $(
        "<div id=\"shopItemImage" + i + "\" class=\"shopItemImage\"></div>"
      );
      const itemCount = $(
        "<div id=\"shopItemCount" + i + "\" class=\"shopItemCount\"></div>"
      );
      const itemPrice = $(
        "<div id=\"shopItemPrice" + i + "\" class=\"shopItemPrice\"></div>"
      );
      const itemName = $(
        "<div id=\"shopItemName" + i + "\" class=\"shopItemName\"></div>"
      );
      const itemBuy = $(
        "<div id=\"shopItemBuy" + i + "\" class=\"shopItemBuy\"></div>"
      );

      itemImage.css(
        "background-image",
        this.container.getImageFormat(1, string)
      );
      itemCount.html(count);
      itemPrice.html(price + "g");
      itemName.html(name);
      itemBuy.html("Buy");

      this.container.setSlot(i, {
        string: string,
        count: count
      });

      // Bind the itemBuy to the local buy function.
      itemBuy.click(event => {
        this.buy(event);
      });

      const listItem = $("<li></li>");

      shopItem.append(itemImage, itemCount, itemPrice, itemName, itemBuy);

      listItem.append(shopItem);

      this.getShopList().append(listItem);
    }

    const inventoryItems = this.interface.bank.getInventoryList();
    const inventorySize = this.interface.inventory.getSize();

    for (let j = 0; j < inventorySize; j++) {
      const item = $(inventoryItems[j]).clone();
      const slot = item.find("#bankInventorySlot" + j);

      slot.attr("id", "shopInventorySlot" + j);

      slot.click(event => {
        this.select(event);
      });

      this.getInventoryList().append(slot);
    }
  }

  reset() {
    this.items = [];
    this.counts = [];

    this.container = null;

    this.getShopList().empty();
    this.getInventoryList().empty();
  }

  open(id) {
    if (!id) {
      return;
    }

    this.openShop = id;

    this.body.fadeIn("slow");
  }

  hide() {
    this.openShop = -1;

    this.body.fadeOut("fast");
  }

  clear() {
    if (this.shop) {
      this.shop.find("ul").empty();
    }

    if (this.inventory) {
      this.inventory.find("ul").empty();
    }

    if (this.close) {
      this.close.unbind("click");
    }

    if (this.sellSlot) {
      this.sellSlot.unbind("click");
    }

    if (this.confirmSell) {
      this.confirmSell.unbind("click");
    }
  }

  getScale() {
    return this.game.renderer.getScale();
  }

  isVisible() {
    return this.body.css("display") === "block";
  }

  isShopOpen(shopId) {
    return this.isVisible() && this.openShop === shopId;
  }

  getShopList() {
    return this.shop.find("ul");
  }

  getInventoryList() {
    return this.inventory.find("ul");
  }
}

export default Shop;
