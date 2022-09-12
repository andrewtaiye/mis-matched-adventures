class OverworldMap {
  constructor(config) {
    this.world = null;
    this.gameObjects = {};
    this.configObjects = config.configObjects;

    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utility.withGrid(10.5) - cameraPerson.x,
      utility.withGrid(6) - cameraPerson.y
    );
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utility.withGrid(10.5) - cameraPerson.x,
      utility.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utility.nextPosition(currentX, currentY, direction);
    if (this.walls[`${x},${y}`]) {
      return true;
    }

    return Object.values(this.gameObjects).find((object) => {
      if (object.x === x && object.y === y) {
        return true;
      }
      if (
        object.intentPosition &&
        (object.intentPosition[0] === x) & (object.intentPosition[1] === y)
      ) {
        return true;
      }
      return false;
    });
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach((key) => {
      let object = this.configObjects[key];
      object.id = key;

      let instance;
      if (object.type === "Person") {
        instance = new Person(object, this.isCutscenePlaying);
      }
      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;

      instance.mount(this);
    });
  }

  async startCutscene(events) {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.isCutscenePlaying = true;
    });

    this.isCutscenePlaying = true;

    // start loop of async events and await each one
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        map: this,
        event: events[i],
      });
      await eventHandler.init();
    }

    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key];
      object.isCutscenePlaying = false;
    });
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utility.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      // Check if the event has not yet been completed
      if (!match[0].eventCompleted) {
        // If event is not yet completed, run event
        this.startCutscene(match[0].events);
        // After event is run, set the event completed flag to true
        // match[0].eventCompleted = true;
      }
    }
  }
}

window.OverworldMaps = {
  Overworld: {
    lowerSrc: "assets/maps/overworldLower.png",
    upperSrc: "assets/maps/overworldUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        x: utility.withGrid(10),
        y: utility.withGrid(9),
        isPlayerControlled: true,
      },
      npc1: {
        type: "Person",
        x: utility.withGrid(17),
        y: utility.withGrid(9),
        src: "assets/characters/people/npc1.png",
        // behaviorLoop: [
        //   { type: "walk", direction: "down" },
        //   { type: "stand", direction: "left", time: 1200 },
        //   { type: "walk", direction: "up" },
        //   { type: "stand", direction: "down", time: 1500 },
        // ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "Who the hell are you?",
                faceHero: "npc1",
              },
              {
                type: "textMessage",
                text: "Which hole did you crawl out from?",
              },
            ],
            // eventCompleted: false,
          },
        ],
      },
      npc2: {
        type: "Person",
        x: utility.withGrid(12),
        y: utility.withGrid(8),
        src: "assets/characters/people/npc2.png",
        behaviorLoop: [
          { type: "walk", direction: "left" },
          { type: "stand", direction: "down", time: 800 },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "right", time: 800 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "left", time: 800 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "down", time: 800 },
        ],
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I'm busy can't you see?",
                faceHero: "npc2",
              },
              { type: "textMessage", text: "Go away, leave me alone." },
            ],
            // eventCompleted: false,
          },
        ],
      },
      slime001: {
        type: "Person",
        isMonster: true,
        x: utility.withGrid(16),
        y: utility.withGrid(4),
        src: "assets/characters/monsters/slime_blue.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I'm busy can't you see?",
              },
              { type: "battle" },
            ],
            // eventCompleted: false,
          },
        ],
      },
      dragon001: {
        type: "Person",
        isMonster: true,
        x: utility.withGrid(16),
        y: utility.withGrid(6),
        src: "assets/characters/monsters/dragon_baby_bronze.png",
        talking: [
          {
            events: [
              {
                type: "textMessage",
                text: "I'm busy can't you see?",
              },
              { type: "battle" },
            ],
            // eventCompleted: false,
          },
        ],
      },
    },
    cutsceneSpaces: {
      // Spaces to trigger interactions with NPCs
      [utility.asGridCoord(18, 11)]: [
        {
          events: [
            { who: "npc1", type: "walk", direction: "down" },
            { who: "npc1", type: "walk", direction: "down" },
            { who: "npc1", type: "stand", direction: "right" },
            { who: "hero", type: "stand", direction: "left" },
            {
              type: "textMessage",
              text: "Hey! You can't go out there like that!",
            },
            { who: "npc1", type: "walk", direction: "up" },
            { who: "npc1", type: "walk", direction: "up" },
            { who: "npc1", type: "stand", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
            { who: "hero", type: "stand", direction: "up" },
          ],
        },
      ],
      // Spaces to trigger map changes (currently not used)
      // [utility.asGridCoord(18, 4)]: [
      //   {
      //     events: [{ type: "changeMap", map: "Overworld" }],
      //   },
      // ],
    },
    walls: {
      // Object used here instead of array so that the lookup for each wall is cleaner (rather than iterating through the entire array each time)
      // Square brackets here tells JS that this is a dynamic key which evaluates to a string (i.e. whatever is returned from the function within the brackets is turned into a string)
      [utility.asGridCoord(14, 3)]: true,
      [utility.asGridCoord(15, 3)]: true,
      [utility.asGridCoord(16, 3)]: true,
      [utility.asGridCoord(17, 3)]: true,
      [utility.asGridCoord(18, 3)]: true,
      [utility.asGridCoord(19, 3)]: true,
      [utility.asGridCoord(13, 4)]: true,
      [utility.asGridCoord(14, 4)]: true,
      [utility.asGridCoord(19, 4)]: true,
      [utility.asGridCoord(20, 4)]: true,
      [utility.asGridCoord(21, 4)]: true,
      [utility.asGridCoord(10, 5)]: true,
      [utility.asGridCoord(11, 5)]: true,
      [utility.asGridCoord(12, 5)]: true,
      [utility.asGridCoord(13, 5)]: true,
      [utility.asGridCoord(17, 5)]: true,
      [utility.asGridCoord(18, 5)]: true,
      [utility.asGridCoord(20, 5)]: true,
      [utility.asGridCoord(22, 5)]: true,
      [utility.asGridCoord(23, 5)]: true,
      [utility.asGridCoord(24, 5)]: true,
      [utility.asGridCoord(25, 5)]: true,
      [utility.asGridCoord(26, 5)]: true,
      [utility.asGridCoord(27, 5)]: true,
      [utility.asGridCoord(28, 5)]: true,
      [utility.asGridCoord(9, 6)]: true,
      [utility.asGridCoord(10, 6)]: true,
      [utility.asGridCoord(13, 6)]: true,
      [utility.asGridCoord(17, 6)]: true,
      [utility.asGridCoord(18, 6)]: true,
      [utility.asGridCoord(19, 6)]: true,
      [utility.asGridCoord(20, 6)]: true,
      [utility.asGridCoord(29, 6)]: true,
      [utility.asGridCoord(30, 6)]: true,
      [utility.asGridCoord(31, 6)]: true,
      [utility.asGridCoord(32, 6)]: true,
      [utility.asGridCoord(33, 6)]: true,
      [utility.asGridCoord(9, 7)]: true,
      [utility.asGridCoord(11, 7)]: true,
      [utility.asGridCoord(12, 7)]: true,
      [utility.asGridCoord(13, 7)]: true,
      [utility.asGridCoord(15, 7)]: true,
      [utility.asGridCoord(17, 7)]: true,
      [utility.asGridCoord(18, 7)]: true,
      [utility.asGridCoord(19, 7)]: true,
      [utility.asGridCoord(20, 7)]: true,
      [utility.asGridCoord(27, 7)]: true,
      [utility.asGridCoord(28, 7)]: true,
      [utility.asGridCoord(31, 7)]: true,
      [utility.asGridCoord(33, 7)]: true,
      [utility.asGridCoord(9, 8)]: true,
      [utility.asGridCoord(10, 8)]: true,
      [utility.asGridCoord(15, 8)]: true,
      [utility.asGridCoord(17, 8)]: true,
      [utility.asGridCoord(18, 8)]: true,
      [utility.asGridCoord(19, 8)]: true,
      [utility.asGridCoord(20, 8)]: true,
      [utility.asGridCoord(23, 8)]: true,
      [utility.asGridCoord(24, 8)]: true,
      [utility.asGridCoord(26, 8)]: true,
      [utility.asGridCoord(32, 8)]: true,
      [utility.asGridCoord(33, 8)]: true,
      [utility.asGridCoord(9, 9)]: true,
      [utility.asGridCoord(12, 9)]: true,
      [utility.asGridCoord(16, 9)]: true,
      [utility.asGridCoord(18, 9)]: true,
      [utility.asGridCoord(19, 9)]: true,
      [utility.asGridCoord(20, 9)]: true,
      [utility.asGridCoord(23, 9)]: true,
      [utility.asGridCoord(24, 9)]: true,
      [utility.asGridCoord(27, 9)]: true,
      [utility.asGridCoord(31, 9)]: true,
      [utility.asGridCoord(32, 9)]: true,
      [utility.asGridCoord(33, 9)]: true,
      [utility.asGridCoord(9, 10)]: true,
      [utility.asGridCoord(14, 10)]: true,
      [utility.asGridCoord(18, 10)]: true,
      [utility.asGridCoord(19, 10)]: true,
      [utility.asGridCoord(27, 10)]: true,
      [utility.asGridCoord(31, 10)]: true,
      [utility.asGridCoord(33, 10)]: true,
      [utility.asGridCoord(9, 11)]: true,
      [utility.asGridCoord(10, 11)]: true,
      [utility.asGridCoord(11, 11)]: true,
      [utility.asGridCoord(13, 11)]: true,
      [utility.asGridCoord(19, 11)]: true,
      [utility.asGridCoord(24, 11)]: true,
      [utility.asGridCoord(25, 11)]: true,
      [utility.asGridCoord(27, 11)]: true,
      [utility.asGridCoord(28, 11)]: true,
      [utility.asGridCoord(30, 11)]: true,
      [utility.asGridCoord(33, 11)]: true,
      [utility.asGridCoord(9, 12)]: true,
      [utility.asGridCoord(10, 12)]: true,
      [utility.asGridCoord(11, 12)]: true,
      [utility.asGridCoord(12, 12)]: true,
      [utility.asGridCoord(13, 12)]: true,
      [utility.asGridCoord(14, 12)]: true,
      [utility.asGridCoord(15, 12)]: true,
      [utility.asGridCoord(16, 12)]: true,
      [utility.asGridCoord(17, 12)]: true,
      [utility.asGridCoord(24, 12)]: true,
      [utility.asGridCoord(25, 12)]: true,
      [utility.asGridCoord(33, 12)]: true,
      [utility.asGridCoord(10, 13)]: true,
      [utility.asGridCoord(11, 13)]: true,
      [utility.asGridCoord(12, 13)]: true,
      [utility.asGridCoord(15, 13)]: true,
      [utility.asGridCoord(16, 13)]: true,
      [utility.asGridCoord(17, 13)]: true,
      [utility.asGridCoord(20, 13)]: true,
      [utility.asGridCoord(21, 13)]: true,
      [utility.asGridCoord(22, 13)]: true,
      [utility.asGridCoord(33, 13)]: true,
      [utility.asGridCoord(16, 14)]: true,
      [utility.asGridCoord(17, 14)]: true,
      [utility.asGridCoord(20, 14)]: true,
      [utility.asGridCoord(21, 14)]: true,
      [utility.asGridCoord(22, 14)]: true,
      [utility.asGridCoord(28, 14)]: true,
      [utility.asGridCoord(33, 14)]: true,
      [utility.asGridCoord(8, 15)]: true,
      [utility.asGridCoord(9, 15)]: true,
      [utility.asGridCoord(16, 15)]: true,
      [utility.asGridCoord(27, 15)]: true,
      [utility.asGridCoord(28, 15)]: true,
      [utility.asGridCoord(29, 15)]: true,
      [utility.asGridCoord(33, 15)]: true,
      [utility.asGridCoord(7, 16)]: true,
      [utility.asGridCoord(8, 16)]: true,
      [utility.asGridCoord(10, 16)]: true,
      [utility.asGridCoord(11, 16)]: true,
      [utility.asGridCoord(12, 16)]: true,
      [utility.asGridCoord(16, 16)]: true,
      [utility.asGridCoord(17, 16)]: true,
      [utility.asGridCoord(23, 16)]: true,
      [utility.asGridCoord(26, 16)]: true,
      [utility.asGridCoord(27, 16)]: true,
      [utility.asGridCoord(28, 16)]: true,
      [utility.asGridCoord(33, 16)]: true,
      [utility.asGridCoord(7, 17)]: true,
      [utility.asGridCoord(12, 17)]: true,
      [utility.asGridCoord(13, 17)]: true,
      [utility.asGridCoord(14, 17)]: true,
      [utility.asGridCoord(15, 17)]: true,
      [utility.asGridCoord(16, 17)]: true,
      [utility.asGridCoord(17, 17)]: true,
      [utility.asGridCoord(18, 17)]: true,
      [utility.asGridCoord(21, 17)]: true,
      [utility.asGridCoord(23, 17)]: true,
      [utility.asGridCoord(26, 17)]: true,
      [utility.asGridCoord(27, 17)]: true,
      [utility.asGridCoord(31, 17)]: true,
      [utility.asGridCoord(33, 17)]: true,
      [utility.asGridCoord(6, 18)]: true,
      [utility.asGridCoord(7, 18)]: true,
      [utility.asGridCoord(8, 18)]: true,
      [utility.asGridCoord(9, 18)]: true,
      [utility.asGridCoord(13, 18)]: true,
      [utility.asGridCoord(17, 18)]: true,
      [utility.asGridCoord(21, 18)]: true,
      [utility.asGridCoord(23, 18)]: true,
      [utility.asGridCoord(30, 18)]: true,
      [utility.asGridCoord(31, 18)]: true,
      [utility.asGridCoord(33, 18)]: true,
      [utility.asGridCoord(6, 19)]: true,
      [utility.asGridCoord(7, 19)]: true,
      [utility.asGridCoord(8, 19)]: true,
      [utility.asGridCoord(9, 19)]: true,
      [utility.asGridCoord(11, 19)]: true,
      [utility.asGridCoord(12, 19)]: true,
      [utility.asGridCoord(14, 19)]: true,
      [utility.asGridCoord(15, 19)]: true,
      [utility.asGridCoord(17, 19)]: true,
      [utility.asGridCoord(20, 19)]: true,
      [utility.asGridCoord(27, 19)]: true,
      [utility.asGridCoord(28, 19)]: true,
      [utility.asGridCoord(31, 19)]: true,
      [utility.asGridCoord(33, 19)]: true,
      [utility.asGridCoord(6, 20)]: true,
      [utility.asGridCoord(7, 20)]: true,
      [utility.asGridCoord(9, 20)]: true,
      [utility.asGridCoord(12, 20)]: true,
      [utility.asGridCoord(15, 20)]: true,
      [utility.asGridCoord(17, 20)]: true,
      [utility.asGridCoord(22, 20)]: true,
      [utility.asGridCoord(26, 20)]: true,
      [utility.asGridCoord(33, 20)]: true,
      [utility.asGridCoord(5, 21)]: true,
      [utility.asGridCoord(14, 21)]: true,
      [utility.asGridCoord(25, 21)]: true,
      [utility.asGridCoord(26, 21)]: true,
      [utility.asGridCoord(29, 21)]: true,
      [utility.asGridCoord(30, 21)]: true,
      [utility.asGridCoord(32, 21)]: true,
      [utility.asGridCoord(33, 21)]: true,
      [utility.asGridCoord(5, 22)]: true,
      [utility.asGridCoord(6, 22)]: true,
      [utility.asGridCoord(8, 22)]: true,
      [utility.asGridCoord(9, 22)]: true,
      [utility.asGridCoord(10, 22)]: true,
      [utility.asGridCoord(11, 22)]: true,
      [utility.asGridCoord(13, 22)]: true,
      [utility.asGridCoord(18, 22)]: true,
      [utility.asGridCoord(26, 22)]: true,
      [utility.asGridCoord(28, 22)]: true,
      [utility.asGridCoord(29, 22)]: true,
      [utility.asGridCoord(33, 22)]: true,
      [utility.asGridCoord(5, 23)]: true,
      [utility.asGridCoord(7, 23)]: true,
      [utility.asGridCoord(8, 23)]: true,
      [utility.asGridCoord(9, 23)]: true,
      [utility.asGridCoord(10, 23)]: true,
      [utility.asGridCoord(17, 23)]: true,
      [utility.asGridCoord(21, 23)]: true,
      [utility.asGridCoord(24, 23)]: true,
      [utility.asGridCoord(28, 23)]: true,
      [utility.asGridCoord(31, 23)]: true,
      [utility.asGridCoord(33, 23)]: true,
      [utility.asGridCoord(5, 24)]: true,
      [utility.asGridCoord(14, 24)]: true,
      [utility.asGridCoord(16, 24)]: true,
      [utility.asGridCoord(17, 24)]: true,
      [utility.asGridCoord(19, 24)]: true,
      [utility.asGridCoord(21, 24)]: true,
      [utility.asGridCoord(22, 24)]: true,
      [utility.asGridCoord(23, 24)]: true,
      [utility.asGridCoord(24, 24)]: true,
      [utility.asGridCoord(25, 24)]: true,
      [utility.asGridCoord(28, 24)]: true,
      [utility.asGridCoord(29, 24)]: true,
      [utility.asGridCoord(30, 24)]: true,
      [utility.asGridCoord(31, 24)]: true,
      [utility.asGridCoord(32, 24)]: true,
      [utility.asGridCoord(33, 24)]: true,
      [utility.asGridCoord(5, 25)]: true,
      [utility.asGridCoord(6, 25)]: true,
      [utility.asGridCoord(7, 25)]: true,
      [utility.asGridCoord(8, 25)]: true,
      [utility.asGridCoord(16, 25)]: true,
      [utility.asGridCoord(17, 25)]: true,
      [utility.asGridCoord(20, 25)]: true,
      [utility.asGridCoord(21, 25)]: true,
      [utility.asGridCoord(27, 25)]: true,
      [utility.asGridCoord(28, 25)]: true,
      [utility.asGridCoord(4, 26)]: true,
      [utility.asGridCoord(6, 26)]: true,
      [utility.asGridCoord(7, 26)]: true,
      [utility.asGridCoord(8, 26)]: true,
      [utility.asGridCoord(9, 26)]: true,
      [utility.asGridCoord(15, 26)]: true,
      [utility.asGridCoord(19, 26)]: true,
      [utility.asGridCoord(20, 26)]: true,
      [utility.asGridCoord(21, 26)]: true,
      [utility.asGridCoord(23, 26)]: true,
      [utility.asGridCoord(25, 26)]: true,
      [utility.asGridCoord(26, 26)]: true,
      [utility.asGridCoord(4, 27)]: true,
      [utility.asGridCoord(7, 27)]: true,
      [utility.asGridCoord(8, 27)]: true,
      [utility.asGridCoord(9, 27)]: true,
      [utility.asGridCoord(10, 27)]: true,
      [utility.asGridCoord(13, 27)]: true,
      [utility.asGridCoord(14, 27)]: true,
      [utility.asGridCoord(17, 27)]: true,
      [utility.asGridCoord(19, 27)]: true,
      [utility.asGridCoord(20, 27)]: true,
      [utility.asGridCoord(23, 27)]: true,
      [utility.asGridCoord(25, 27)]: true,
      [utility.asGridCoord(4, 28)]: true,
      [utility.asGridCoord(7, 28)]: true,
      [utility.asGridCoord(8, 28)]: true,
      [utility.asGridCoord(9, 28)]: true,
      [utility.asGridCoord(10, 28)]: true,
      [utility.asGridCoord(16, 28)]: true,
      [utility.asGridCoord(17, 28)]: true,
      [utility.asGridCoord(20, 28)]: true,
      [utility.asGridCoord(22, 28)]: true,
      [utility.asGridCoord(23, 28)]: true,
      [utility.asGridCoord(25, 28)]: true,
      [utility.asGridCoord(4, 29)]: true,
      [utility.asGridCoord(6, 29)]: true,
      [utility.asGridCoord(7, 29)]: true,
      [utility.asGridCoord(8, 29)]: true,
      [utility.asGridCoord(9, 29)]: true,
      [utility.asGridCoord(16, 29)]: true,
      [utility.asGridCoord(17, 29)]: true,
      [utility.asGridCoord(18, 29)]: true,
      [utility.asGridCoord(22, 29)]: true,
      [utility.asGridCoord(23, 29)]: true,
      [utility.asGridCoord(25, 29)]: true,
      [utility.asGridCoord(4, 30)]: true,
      [utility.asGridCoord(18, 30)]: true,
      [utility.asGridCoord(19, 30)]: true,
      [utility.asGridCoord(20, 30)]: true,
      [utility.asGridCoord(21, 30)]: true,
      [utility.asGridCoord(22, 30)]: true,
      [utility.asGridCoord(25, 30)]: true,
      [utility.asGridCoord(36, 30)]: true,
      [utility.asGridCoord(37, 30)]: true,
      [utility.asGridCoord(38, 30)]: true,
      [utility.asGridCoord(39, 30)]: true,
      [utility.asGridCoord(4, 31)]: true,
      [utility.asGridCoord(6, 31)]: true,
      [utility.asGridCoord(7, 31)]: true,
      [utility.asGridCoord(9, 31)]: true,
      [utility.asGridCoord(10, 31)]: true,
      [utility.asGridCoord(16, 31)]: true,
      [utility.asGridCoord(20, 31)]: true,
      [utility.asGridCoord(21, 31)]: true,
      [utility.asGridCoord(24, 31)]: true,
      [utility.asGridCoord(25, 31)]: true,
      [utility.asGridCoord(34, 31)]: true,
      [utility.asGridCoord(35, 31)]: true,
      [utility.asGridCoord(38, 31)]: true,
      [utility.asGridCoord(39, 31)]: true,
      [utility.asGridCoord(40, 31)]: true,
      [utility.asGridCoord(4, 32)]: true,
      [utility.asGridCoord(6, 32)]: true,
      [utility.asGridCoord(7, 32)]: true,
      [utility.asGridCoord(9, 32)]: true,
      [utility.asGridCoord(10, 32)]: true,
      [utility.asGridCoord(11, 32)]: true,
      [utility.asGridCoord(12, 32)]: true,
      [utility.asGridCoord(13, 32)]: true,
      [utility.asGridCoord(15, 32)]: true,
      [utility.asGridCoord(17, 32)]: true,
      [utility.asGridCoord(20, 32)]: true,
      [utility.asGridCoord(24, 32)]: true,
      [utility.asGridCoord(25, 32)]: true,
      [utility.asGridCoord(26, 32)]: true,
      [utility.asGridCoord(27, 32)]: true,
      [utility.asGridCoord(28, 32)]: true,
      [utility.asGridCoord(32, 32)]: true,
      [utility.asGridCoord(33, 32)]: true,
      [utility.asGridCoord(34, 32)]: true,
      [utility.asGridCoord(35, 32)]: true,
      [utility.asGridCoord(40, 32)]: true,
      [utility.asGridCoord(41, 32)]: true,
      [utility.asGridCoord(4, 33)]: true,
      [utility.asGridCoord(11, 33)]: true,
      [utility.asGridCoord(18, 33)]: true,
      [utility.asGridCoord(29, 33)]: true,
      [utility.asGridCoord(30, 33)]: true,
      [utility.asGridCoord(31, 33)]: true,
      [utility.asGridCoord(32, 33)]: true,
      [utility.asGridCoord(35, 33)]: true,
      [utility.asGridCoord(36, 33)]: true,
      [utility.asGridCoord(38, 33)]: true,
      [utility.asGridCoord(39, 33)]: true,
      [utility.asGridCoord(40, 33)]: true,
      [utility.asGridCoord(4, 34)]: true,
      [utility.asGridCoord(8, 34)]: true,
      [utility.asGridCoord(12, 34)]: true,
      [utility.asGridCoord(18, 34)]: true,
      [utility.asGridCoord(21, 34)]: true,
      [utility.asGridCoord(38, 34)]: true,
      [utility.asGridCoord(4, 35)]: true,
      [utility.asGridCoord(10, 35)]: true,
      [utility.asGridCoord(11, 35)]: true,
      [utility.asGridCoord(14, 35)]: true,
      [utility.asGridCoord(18, 35)]: true,
      [utility.asGridCoord(19, 35)]: true,
      [utility.asGridCoord(23, 35)]: true,
      [utility.asGridCoord(29, 35)]: true,
      [utility.asGridCoord(30, 35)]: true,
      [utility.asGridCoord(31, 35)]: true,
      [utility.asGridCoord(36, 35)]: true,
      [utility.asGridCoord(37, 35)]: true,
      [utility.asGridCoord(38, 35)]: true,
      [utility.asGridCoord(4, 36)]: true,
      [utility.asGridCoord(5, 36)]: true,
      [utility.asGridCoord(7, 36)]: true,
      [utility.asGridCoord(10, 36)]: true,
      [utility.asGridCoord(13, 36)]: true,
      [utility.asGridCoord(14, 36)]: true,
      [utility.asGridCoord(17, 36)]: true,
      [utility.asGridCoord(27, 36)]: true,
      [utility.asGridCoord(28, 36)]: true,
      [utility.asGridCoord(32, 36)]: true,
      [utility.asGridCoord(36, 36)]: true,
      [utility.asGridCoord(38, 36)]: true,
      [utility.asGridCoord(5, 37)]: true,
      [utility.asGridCoord(6, 37)]: true,
      [utility.asGridCoord(7, 37)]: true,
      [utility.asGridCoord(10, 37)]: true,
      [utility.asGridCoord(11, 37)]: true,
      [utility.asGridCoord(16, 37)]: true,
      [utility.asGridCoord(17, 37)]: true,
      [utility.asGridCoord(26, 37)]: true,
      [utility.asGridCoord(31, 37)]: true,
      [utility.asGridCoord(38, 37)]: true,
      [utility.asGridCoord(7, 38)]: true,
      [utility.asGridCoord(11, 38)]: true,
      [utility.asGridCoord(16, 38)]: true,
      [utility.asGridCoord(21, 38)]: true,
      [utility.asGridCoord(22, 38)]: true,
      [utility.asGridCoord(23, 38)]: true,
      [utility.asGridCoord(26, 38)]: true,
      [utility.asGridCoord(29, 38)]: true,
      [utility.asGridCoord(35, 38)]: true,
      [utility.asGridCoord(37, 38)]: true,
      [utility.asGridCoord(38, 38)]: true,
      [utility.asGridCoord(7, 39)]: true,
      [utility.asGridCoord(8, 39)]: true,
      [utility.asGridCoord(12, 39)]: true,
      [utility.asGridCoord(13, 39)]: true,
      [utility.asGridCoord(15, 39)]: true,
      [utility.asGridCoord(21, 39)]: true,
      [utility.asGridCoord(22, 39)]: true,
      [utility.asGridCoord(23, 39)]: true,
      [utility.asGridCoord(26, 39)]: true,
      [utility.asGridCoord(28, 39)]: true,
      [utility.asGridCoord(32, 39)]: true,
      [utility.asGridCoord(36, 39)]: true,
      [utility.asGridCoord(8, 40)]: true,
      [utility.asGridCoord(20, 40)]: true,
      [utility.asGridCoord(21, 40)]: true,
      [utility.asGridCoord(22, 40)]: true,
      [utility.asGridCoord(23, 40)]: true,
      [utility.asGridCoord(27, 40)]: true,
      [utility.asGridCoord(31, 40)]: true,
      [utility.asGridCoord(35, 40)]: true,
      [utility.asGridCoord(36, 40)]: true,
      [utility.asGridCoord(8, 41)]: true,
      [utility.asGridCoord(28, 41)]: true,
      [utility.asGridCoord(30, 41)]: true,
      [utility.asGridCoord(34, 41)]: true,
      [utility.asGridCoord(35, 41)]: true,
      [utility.asGridCoord(8, 42)]: true,
      [utility.asGridCoord(9, 42)]: true,
      [utility.asGridCoord(15, 42)]: true,
      [utility.asGridCoord(16, 42)]: true,
      [utility.asGridCoord(17, 42)]: true,
      [utility.asGridCoord(25, 42)]: true,
      [utility.asGridCoord(33, 42)]: true,
      [utility.asGridCoord(9, 43)]: true,
      [utility.asGridCoord(10, 43)]: true,
      [utility.asGridCoord(11, 43)]: true,
      [utility.asGridCoord(13, 43)]: true,
      [utility.asGridCoord(15, 43)]: true,
      [utility.asGridCoord(16, 43)]: true,
      [utility.asGridCoord(17, 43)]: true,
      [utility.asGridCoord(24, 43)]: true,
      [utility.asGridCoord(25, 43)]: true,
      [utility.asGridCoord(33, 43)]: true,
      [utility.asGridCoord(9, 44)]: true,
      [utility.asGridCoord(10, 44)]: true,
      [utility.asGridCoord(13, 44)]: true,
      [utility.asGridCoord(28, 44)]: true,
      [utility.asGridCoord(29, 44)]: true,
      [utility.asGridCoord(33, 44)]: true,
      [utility.asGridCoord(9, 45)]: true,
      [utility.asGridCoord(10, 45)]: true,
      [utility.asGridCoord(16, 45)]: true,
      [utility.asGridCoord(17, 45)]: true,
      [utility.asGridCoord(18, 45)]: true,
      [utility.asGridCoord(20, 45)]: true,
      [utility.asGridCoord(21, 45)]: true,
      [utility.asGridCoord(22, 45)]: true,
      [utility.asGridCoord(28, 45)]: true,
      [utility.asGridCoord(29, 45)]: true,
      [utility.asGridCoord(33, 45)]: true,
      [utility.asGridCoord(9, 46)]: true,
      [utility.asGridCoord(10, 46)]: true,
      [utility.asGridCoord(13, 46)]: true,
      [utility.asGridCoord(14, 46)]: true,
      [utility.asGridCoord(15, 46)]: true,
      [utility.asGridCoord(16, 46)]: true,
      [utility.asGridCoord(17, 46)]: true,
      [utility.asGridCoord(18, 46)]: true,
      [utility.asGridCoord(20, 46)]: true,
      [utility.asGridCoord(21, 46)]: true,
      [utility.asGridCoord(22, 46)]: true,
      [utility.asGridCoord(23, 46)]: true,
      [utility.asGridCoord(24, 46)]: true,
      [utility.asGridCoord(25, 46)]: true,
      [utility.asGridCoord(26, 46)]: true,
      [utility.asGridCoord(32, 46)]: true,
      [utility.asGridCoord(9, 47)]: true,
      [utility.asGridCoord(12, 47)]: true,
      [utility.asGridCoord(13, 47)]: true,
      [utility.asGridCoord(14, 47)]: true,
      [utility.asGridCoord(15, 47)]: true,
      [utility.asGridCoord(16, 47)]: true,
      [utility.asGridCoord(18, 47)]: true,
      [utility.asGridCoord(23, 47)]: true,
      [utility.asGridCoord(24, 47)]: true,
      [utility.asGridCoord(25, 47)]: true,
      [utility.asGridCoord(26, 47)]: true,
      [utility.asGridCoord(27, 47)]: true,
      [utility.asGridCoord(31, 47)]: true,
      [utility.asGridCoord(32, 47)]: true,
      [utility.asGridCoord(9, 48)]: true,
      [utility.asGridCoord(10, 48)]: true,
      [utility.asGridCoord(11, 48)]: true,
      [utility.asGridCoord(12, 48)]: true,
      [utility.asGridCoord(13, 48)]: true,
      [utility.asGridCoord(14, 48)]: true,
      [utility.asGridCoord(26, 48)]: true,
      [utility.asGridCoord(27, 48)]: true,
      [utility.asGridCoord(28, 48)]: true,
      [utility.asGridCoord(29, 48)]: true,
      [utility.asGridCoord(32, 48)]: true,
      [utility.asGridCoord(9, 49)]: true,
      [utility.asGridCoord(10, 49)]: true,
      [utility.asGridCoord(11, 49)]: true,
      [utility.asGridCoord(12, 49)]: true,
      [utility.asGridCoord(13, 49)]: true,
      [utility.asGridCoord(18, 49)]: true,
      [utility.asGridCoord(20, 49)]: true,
      [utility.asGridCoord(22, 49)]: true,
      [utility.asGridCoord(26, 49)]: true,
      [utility.asGridCoord(27, 49)]: true,
      [utility.asGridCoord(28, 49)]: true,
      [utility.asGridCoord(29, 49)]: true,
      [utility.asGridCoord(30, 49)]: true,
      [utility.asGridCoord(31, 49)]: true,
      [utility.asGridCoord(9, 50)]: true,
      [utility.asGridCoord(10, 50)]: true,
      [utility.asGridCoord(11, 50)]: true,
      [utility.asGridCoord(12, 50)]: true,
      [utility.asGridCoord(15, 50)]: true,
      [utility.asGridCoord(16, 50)]: true,
      [utility.asGridCoord(17, 50)]: true,
      [utility.asGridCoord(21, 50)]: true,
      [utility.asGridCoord(22, 50)]: true,
      [utility.asGridCoord(23, 50)]: true,
      [utility.asGridCoord(26, 50)]: true,
      [utility.asGridCoord(27, 50)]: true,
      [utility.asGridCoord(28, 50)]: true,
      [utility.asGridCoord(29, 50)]: true,
      [utility.asGridCoord(30, 50)]: true,
      [utility.asGridCoord(9, 51)]: true,
      [utility.asGridCoord(10, 51)]: true,
      [utility.asGridCoord(12, 51)]: true,
      [utility.asGridCoord(13, 51)]: true,
      [utility.asGridCoord(19, 51)]: true,
      [utility.asGridCoord(29, 51)]: true,
      [utility.asGridCoord(10, 52)]: true,
      [utility.asGridCoord(11, 52)]: true,
      [utility.asGridCoord(15, 52)]: true,
      [utility.asGridCoord(16, 52)]: true,
      [utility.asGridCoord(17, 52)]: true,
      [utility.asGridCoord(21, 52)]: true,
      [utility.asGridCoord(22, 52)]: true,
      [utility.asGridCoord(23, 52)]: true,
      [utility.asGridCoord(28, 52)]: true,
      [utility.asGridCoord(29, 52)]: true,
      [utility.asGridCoord(10, 53)]: true,
      [utility.asGridCoord(11, 53)]: true,
      [utility.asGridCoord(15, 53)]: true,
      [utility.asGridCoord(16, 53)]: true,
      [utility.asGridCoord(17, 53)]: true,
      [utility.asGridCoord(21, 53)]: true,
      [utility.asGridCoord(22, 53)]: true,
      [utility.asGridCoord(23, 53)]: true,
      [utility.asGridCoord(24, 53)]: true,
      [utility.asGridCoord(25, 53)]: true,
      [utility.asGridCoord(27, 53)]: true,
      [utility.asGridCoord(28, 53)]: true,
      [utility.asGridCoord(29, 53)]: true,
      [utility.asGridCoord(10, 54)]: true,
      [utility.asGridCoord(11, 54)]: true,
      [utility.asGridCoord(12, 54)]: true,
      [utility.asGridCoord(27, 54)]: true,
      [utility.asGridCoord(28, 54)]: true,
      [utility.asGridCoord(29, 54)]: true,
      [utility.asGridCoord(11, 55)]: true,
      [utility.asGridCoord(12, 55)]: true,
      [utility.asGridCoord(13, 55)]: true,
      [utility.asGridCoord(14, 55)]: true,
      [utility.asGridCoord(15, 55)]: true,
      [utility.asGridCoord(16, 55)]: true,
      [utility.asGridCoord(17, 55)]: true,
      [utility.asGridCoord(22, 55)]: true,
      [utility.asGridCoord(23, 55)]: true,
      [utility.asGridCoord(24, 55)]: true,
      [utility.asGridCoord(26, 55)]: true,
      [utility.asGridCoord(27, 55)]: true,
      [utility.asGridCoord(28, 55)]: true,
      [utility.asGridCoord(12, 56)]: true,
      [utility.asGridCoord(13, 56)]: true,
      [utility.asGridCoord(14, 56)]: true,
      [utility.asGridCoord(15, 56)]: true,
      [utility.asGridCoord(16, 56)]: true,
      [utility.asGridCoord(17, 56)]: true,
      [utility.asGridCoord(19, 56)]: true,
      [utility.asGridCoord(20, 56)]: true,
      [utility.asGridCoord(22, 56)]: true,
      [utility.asGridCoord(23, 56)]: true,
      [utility.asGridCoord(24, 56)]: true,
      [utility.asGridCoord(25, 56)]: true,
      [utility.asGridCoord(26, 56)]: true,
      [utility.asGridCoord(27, 56)]: true,
      [utility.asGridCoord(15, 57)]: true,
      [utility.asGridCoord(16, 57)]: true,
      [utility.asGridCoord(17, 57)]: true,
      [utility.asGridCoord(19, 57)]: true,
      [utility.asGridCoord(20, 57)]: true,
      [utility.asGridCoord(22, 57)]: true,
      [utility.asGridCoord(28, 57)]: true,
      [utility.asGridCoord(17, 58)]: true,
      [utility.asGridCoord(19, 58)]: true,
      [utility.asGridCoord(20, 58)]: true,
      [utility.asGridCoord(22, 58)]: true,
      [utility.asGridCoord(18, 59)]: true,
      [utility.asGridCoord(21, 59)]: true,
    },
  },
};
