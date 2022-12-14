class Sprite {
  constructor(config) {
    // Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    };

    //Set up the shadow
    this.shadow = new Image();
    this.useShadow = config.useShadow;
    if (this.useShadow) {
      this.shadow.src = "assets/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    };

    // Configure Animation and Initial State
    this.animations = config.animations || {
      "monster-idle-down": [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      "monster-idle-right": [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      "monster-idle-up": [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ],
      "monster-idle-left": [
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
      ],
      "idle-down": [[0, 0]],
      "idle-right": [[0, 1]],
      "idle-up": [[0, 2]],
      "idle-left": [[0, 3]],
      "walk-down": [
        [1, 0],
        [0, 0],
        [3, 0],
        [0, 0],
      ],
      "walk-right": [
        [1, 1],
        [0, 1],
        [3, 1],
        [0, 1],
      ],
      "walk-up": [
        [1, 2],
        [0, 2],
        [3, 2],
        [0, 2],
      ],
      "walk-left": [
        [1, 3],
        [0, 3],
        [3, 3],
        [0, 3],
      ],
    };
    this.currentAnimation = config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 12;
    this.animationFrameProgress = this.animationFrameLimit;

    // Reference the Game Object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
  }

  setAnimation(animation) {
    if (this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    // Downtick frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    // Reset counter
    this.animationFrameProgress = this.animationFrameLimit;

    // Uptick frame
    this.currentAnimationFrame += 1;
    if (this.frame === undefined) {
      this.currentAnimationFrame = 0;
    }
  }

  draw(ctx, cameraPerson) {
    const x = this.gameObject.x - 8 + utility.withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - 17 + utility.withGrid(6) - cameraPerson.y;

    const [frameX, frameY] = this.frame;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);
    this.isLoaded &&
      ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);

    this.updateAnimationProgress();
  }
}
