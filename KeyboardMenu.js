class KeyboardMenu {
  constructor() {
    this.options = [];
    this.up = null;
    this.down = null;
    this.keyZ = null;
    this.prevFocus = null;
  }

  setOptions(options) {
    this.options = options;
    this.element.innerHTML = this.options
      .map((option, index) => {
        const disabledAttr = option.disabled ? "disabled" : "";
        return `
            <div class="option">
                <button ${disabledAttr} data-button="${index}" data-description="${
          option.description
        }">
                    ${option.label}
                </button>
                <span class="right">${option.right ? option.right() : ""}</span>
            </div>
        `;
      })
      .join("");

    this.element.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        // console.log("click", button.dataset);
        const chosenOption = this.options[Number(button.dataset.button)];
        chosenOption.handler();
      });
      button.addEventListener("mouseenter", () => {
        button.focus();
      });
      button.addEventListener("focus", () => {
        this.prevFocus = button;
        this.descriptionElementText.innerText = button.dataset.description;
      });
    });

    setTimeout(() => {
      this.element.querySelector("button[data-button]:not([disabled])").focus();
    }, 10);
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("keyboard-menu");

    this.descriptionElement = document.createElement("div");
    this.descriptionElement.classList.add("description-box");
    this.descriptionElement.innerHTML = `<p>Test Description</p>`;
    this.descriptionElementText = this.descriptionElement.querySelector("p");
  }

  end() {
    // remove menu element and description element
    this.element.remove();
    this.descriptionElement.remove();

    // clean up bindings
    this.up.unbind();
    this.down.unbind();
    this.keyZ.unbind();
  }

  init(container) {
    this.createElement();
    container.appendChild(this.descriptionElement);
    container.appendChild(this.element);

    this.up = new KeypressListener("ArrowUp", () => {
      const current = Number(this.prevFocus.getAttribute("data-button"));
      const prevButton = Array.from(
        this.element.querySelectorAll("button[data-button]")
      )
        .reverse()
        .find((element) => {
          return element.dataset.button < current && !element.disabled;
        });
      prevButton?.focus();
    });

    this.down = new KeypressListener("ArrowDown", () => {
      const current = Number(this.prevFocus.getAttribute("data-button"));
      const nextButton = Array.from(
        this.element.querySelectorAll("button[data-button]")
      ).find((element) => {
        return element.dataset.button > current && !element.disabled;
      });
      nextButton?.focus();
    });

    this.keyZ = new KeypressListener("KeyZ", () => {
      if (this.prevFocus === document.activeElement) {
        this.prevFocus.click();
      }
    });
  }
}
