import Phaser from "phaser";

export class Board extends Phaser.Scene {
    create() {
        console.log("creating board");

        this.resizeToScreen(400, 800);
    }

    resizeToScreen(
        maxWidth: number,
        maxHeight: number,
    ) {
        const resize = () => {
            this.setScreenSize(
                Math.min(maxWidth, document.documentElement.clientWidth),
                Math.min(maxHeight, document.documentElement.clientHeight),
            );
        };

            window.addEventListener("resize", resize);

        //if the screen size is different than the scale size, resize
        if (
            window.innerWidth != this.scale.width ||
            window.innerWidth != this.scale.height
        ) {
            resize();
        }
    }

    setScreenSize(
        width: number,
        height: number,
        cssWidth?: number,
        cssHeight?: number,
    ) {
        // Set screen resolution
        this.game.canvas.width = width;
        this.game.canvas.height = height;

        // If cssWidth and cssHeight are not provided, use width and height
        cssWidth = cssWidth || width;
        cssHeight = cssHeight || height;

        // Set CSS size
        this.game.canvas.style.width = cssWidth + "px";
        this.game.canvas.style.height = cssHeight + "px";

        console.info(`resizing to ${width}x${height}`);
        this.game.renderer.resize(width, height);
        this.scale.resize(width, height);
        this.scale.refresh();
    }
}
