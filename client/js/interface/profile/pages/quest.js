import Page from "../page";

/**
 * @class Quest
 * @extends {Page}
 */
class Quest extends Page {
  /**
   * Creates an instance of Quest.
   *
   * @memberof Quest
   */
  constructor() {
    super("#questPage");

    this.achievements = $("#achievementList");
    this.quests = $("#questList");

    this.achievementsCount = $("#achievementCount");
    this.questCount = $("#questCount");

    this.achievementsList = this.achievements.find("ul");
    this.questList = this.quests.find("ul");

    this.finishedAchievements = 0;
    this.finishedQuests = 0;

    this.achievementsLength = 0;
    this.questsLength = 0;
  }

  loadAchievements(achievements) {
    this.achievementsLength = achievements.length;

    _.each(achievements, achievement => {
      const item = this.getItem(false, achievement.id);
      const name = this.getName(false, achievement.id);

      name.text("????????");

      name.css("background", "rgba(255, 10, 10, 0.3)");

      if (achievement.progress > 0 && achievement.progress < 9999) {
        name.css("background", "rgba(255, 255, 10, 0.4)");

        name.text(
          achievement.name +
            (achievement.count > 2
              ? " " + (achievement.progress - 1) + "/" + (achievement.count - 1)
              : "")
        );
      } else if (achievement.progress > 9998) {
        name.text(achievement.name);
        name.css("background", "rgba(10, 255, 10, 0.3)");
      }

      if (achievement.finished) {
        this.finishedAchievements++;
      }

      item.append(name);

      const listItem = $("<li></li>");

      listItem.append(item);

      this.achievementsList.append(listItem);
    });

    this.updateCount();
  }

  loadQuests(quests) {
    this.questsLength = quests.length;

    _.each(quests, quest => {
      const item = this.getItem(true, quest.id);
      const name = this.getName(true, quest.id);

      name.text(quest.name);

      name.css("background", "rgba(255, 10, 10, 0.3)");

      if (quest.stage > 0 && quest.stage < 9999) {
        name.css("background", "rgba(255, 255, 10, 0.4)");
      } else if (quest.stage > 9998) {
        name.css("background", "rgba(10, 255, 10, 0.3)");
      }

      if (quest.finished) {
        this.finishedQuests++;
      }

      item.append(name);

      const listItem = $("<li></li>");

      listItem.append(item);

      this.questList.append(listItem);
    });

    this.updateCount();
  }

  progress(info) {
    const item = info.isQuest
      ? this.getQuest(info.id)
      : this.getAchievement(info.id);

    if (!item) {
      return;
    }

    const name = item.find(
      "" + (info.isQuest ? "#quest" : "#achievement") + info.id + "name"
    );

    if (!name) {
      return;
    }

    if (!info.isQuest && info.count > 2) {
      name.text(info.name + " " + (info.progress - 1) + "/" + (info.count - 1));
    } else {
      name.text(info.name);
    }

    name.css("background", "rgba(255, 255, 10, 0.4)");

    this.updateCount();
  }

  finish(info) {
    const item = info.isQuest
      ? this.getQuest(info.id)
      : this.getAchievement(info.id);

    if (!item) {
      return;
    }

    const name = item.find(
      "" + (info.isQuest ? "#quest" : "#achievement") + info.id + "name"
    );

    if (!name) {
      return;
    }

    if (!info.isQuest) {
      name.text(info.name);
      this.finishedAchievements++;
    }

    name.css("background", "rgba(10, 255, 10, 0.3)");

    if (info.isQuest) {
      this.finishedQuests++;
    }

    this.updateCount();
  }

  updateCount() {
    if (this.finishedAchievement !== 0 && this.achievementsLength !== 0) {
      this.achievementsCount.html(
        this.finishedAchievements + "/" + this.achievementsLength
      );
    }

    if (this.finishedQuests !== 0 && this.questsLength !== 0) {
      this.questCount.html(this.finishedQuests + "/" + this.questsLength);
    }
  }

  clear() {
    this.achievementsList.empty();
    this.questList.empty();
  }

  getQuest(id) {
    return $(this.questList.find("li")[id]).find("#quest" + id);
  }

  getAchievement(id) {
    return $(this.achievementsList.find("li")[id]).find("#achievement" + id);
  }

  /**
   * Might as well properly organize them based
   * on their type of item and id (index).
   */

  getItem(isQuest, id) {
    return $(
      "<div id=\"" +
        (isQuest ? "quest" : "achievement") +
        id +
        "\" class=\"questItem\"></div>"
    );
  }

  getName(isQuest, id) {
    return $(
      "<div id=\"" +
        (isQuest ? "quest" : "achievement") +
        id +
        "name\" class=\"questName\"></div>"
    );
  }
}

export default Quest;
