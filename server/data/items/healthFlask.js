/* global module */

const Items = require("../../js/util/items");
    const Utils = require("../../js/util/utils");

class HealthFlask {
    constructor (id) {
        const self = this;

        self.id = id;

        self.healAmount = 0;
        self.manaAmount = 0;

        const customData = Items.getCustomData(self.id);

        if (customData) {
            self.healAmount = customData.healAmount ? customData.healAmount : 0;
            self.manaAmount = customData.manaAmount ? customData.manaAmount : 0;
        }
    }

    onUse (character) {
        const self = this;

        if (self.healAmount) { character.healHitPoints(self.healAmount); }

        if (self.manaAmount) { character.healManaPoints(self.manaAmount); }
    }
}

module.exports = HealthFlask;
