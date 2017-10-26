interface IFrameManagerOptions {
    render: () => void;
    update: () => void;
}

export class FrameManager {
    render: () => void;
    update: () => void;
    currentTime: number;
    accumulator: number;
    timeDiff: number;

    constructor(options: IFrameManagerOptions) {
        this.render = options.render;
        this.update = options.update;

        this.currentTime = Date.now();
        this.accumulator = 0.0;
        this.timeDiff = 5;
    }

    Start(): void {
        this.currentTime = Date.now();

        function run(fm: FrameManager) {
            requestAnimationFrame(run.bind(null, fm));

            fm.Step();
        }

        run(this);
    }
    Step(): void {
        const newTime = Date.now();
        const frameTime = newTime - this.currentTime;

        this.currentTime = newTime;
        this.accumulator += frameTime;

        while (this.accumulator >= this.timeDiff) {
            this.update();
            this.accumulator -= this.timeDiff;
        }

        this.update();

        this.render();
    }
}
