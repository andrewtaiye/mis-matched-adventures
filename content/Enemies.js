window.Enemies = {
  greenSlime: {
    name: "Green Slime",
    src: "./assets/characters/monsters/slime_green.png",
    fighters: {
      greenSlime: {
        fighterId: "greenSlime",
        generateStats: true,
        levelSpread: {
          lower: 2,
          upper: 2,
        },
        maxHp: 10,
        level: null,
        stats: {
          attack: null,
          defence: null,
          speed: null,
        },
      },
    },
  },
  babyBronzeDragon: {
    name: "Baby Bronze Dragon",
    src: "./assets/characters/monsters/dragon_baby_bronze.png",
    fighters: {
      babyBronzeDragon: {
        fighterId: "babyBronzeDragon",
        generateStats: true,
        levelSpread: {
          lower: 0,
          upper: 10,
        },
        maxHp: 100,
        level: 20,
        stats: {
          attack: 35,
          defence: 15,
          speed: 10,
        },
      },
    },
  },
};
