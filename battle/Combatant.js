class Combatant {
  constructor(config, battle) {
    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });
    this.hp = typeof this.hp === "undefined" ? this.maxHp : this.hp;
    this.battle = battle;
  }

  get hpPercent() {
    const percent = (this.hp / this.maxHp) * 100;
    return percent > 0 ? percent : 0;
  }

  get xpPercent() {
    return (this.xp / this.maxXp) * 100;
  }

  get isActive() {
    return this.battle.activeCombatants[this.team] === this.id;
  }

  get givesXp() {
    return this.level * 4;
  }

  createElement() {
    this.hudElement = document.createElement("div");
    this.hudElement.classList.add("combatant");
    this.hudElement.setAttribute("data-combatant", this.id);
    this.hudElement.setAttribute("data-team", this.team);

    this.hudElement.innerHTML = `
        <p class="combatant-name">${this.name}</p>
        <p class="combatant-level"></p>
        <div class="combatant-character-crop">
            <img class="combatant-character" alt="${this.name}" src="${this.src}" />
        </div>
        <img class="combatant-type" src="${this.icon}" alt="${this.type}" />
        <svg viewBox=" 0 0 26 3" class="combatant-life-container">
            <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
            <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
        </svg>
        <svg viewBox=" 0 0 26 2" class="combatant-xp-container">
            <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
            <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
        </svg>
        <p class="combatant-status"></p>
    `;

    this.spriteElement = document.createElement("div");
    this.spriteElement.classList.add("sprite");
    this.spriteElement.setAttribute("data-team", this.team);
    this.spriteImage = document.createElement("img");
    this.spriteImage.setAttribute("src", this.src);
    this.spriteImage.setAttribute("alt", this.name);

    this.spriteElement.appendChild(this.spriteImage);

    this.hpFill = this.hudElement.querySelectorAll(
      ".combatant-life-container > rect"
    );

    this.xpFill = this.hudElement.querySelectorAll(
      ".combatant-xp-container > rect"
    );
  }

  update(changes = {}) {
    Object.keys(changes).forEach((key) => {
      this[key] = changes[key];
    });

    this.hudElement.setAttribute("data-active", this.isActive);
    this.spriteElement.setAttribute("data-active", this.isActive);

    this.hpFill.forEach((rect) => {
      rect.style.width = `${this.hpPercent}%`;
      // console.log(this.hpPercent);
    });

    this.xpFill.forEach((rect) => {
      rect.style.width = `${this.xpPercent}%`;
      // console.log(this.xpPercent);
    });

    this.hudElement.querySelector(".combatant-level").innerText = this.level;

    const statusElement = this.hudElement.querySelector(".combatant-status");
    if (this.status) {
      statusElement.innerText = this.status.category;
      statusElement.style.display = "block";
    } else {
      statusElement.innerText = "";
      statusElement.style.display = "none";
    }
  }

  getPostEvents() {
    if (this.status?.type === "healing") {
      // console.log(this.status);
      return [
        { type: "textMessage", text: "Healed 5HP!" },
        { type: "stateChange", recover: 5, onCaster: true },
      ];
    }
    if (this.status?.type === "greaterHealing") {
      // console.log(this.status);
      return [
        { type: "textMessage", text: "Healed 10HP!" },
        { type: "stateChange", recover: 10, onCaster: true },
      ];
    }

    return [];
  }

  getReplacedEvents(originalEvents) {
    // console.log(this.status);
    if (
      this.status?.type === "dizzy" &&
      utility.randomFromArray([true, true, false, false]) // check if combatant is able to attack. if false, combatant will not attack.
    ) {
      return [
        {
          type: "textMessage",
          text: `${this.name} is dizzy and could not attack!`,
        },
      ];
    }
    return originalEvents;
  }

  decrementStatus() {
    // console.log(this);
    if (this.status?.expiresIn > 0) {
      this.status.expiresIn -= 1;
      if (this.status.expiresIn === 0) {
        const event = {
          type: "textMessage",
          text: `${
            this.name
          } is no longer ${this.status.category.toLowerCase()}!`,
        };
        this.update({
          status: null,
        });
        return event;
      }
    }
    return null;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.hudElement);
    container.appendChild(this.spriteElement);

    this.update();
  }
}
