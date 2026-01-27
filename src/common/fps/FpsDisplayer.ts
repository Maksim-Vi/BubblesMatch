import * as PIXI from "pixi.js";

export class FPSDisplayer {
    public text: PIXI.Text;
    private lastTime: number;
    private frames: number;

    constructor() {
        this.text = new PIXI.Text('FPS: 0', {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 0xffffff,
        });

        this.text.x = 0;
        this.text.y = 0;

        this.lastTime = performance.now();
        this.frames = 0;
    }

    public update() {
        this.frames++;
        const now = performance.now();
        const delta = now - this.lastTime;

        if (delta >= 1000) {
            const fps = Math.round((this.frames * 1000) / delta);
            this.text.text = `FPS: ${fps}`;
            this.frames = 0;
            this.lastTime = now;
        }
    }
}
