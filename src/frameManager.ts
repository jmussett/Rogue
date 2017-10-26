interface IFrameManagerOptions {
	render: Function;
	update: Function;
}

export class FrameManager {
	render: Function;
	update: Function;
	currentTime: number;
	accumulator: number;
	timeDiff: number;

	constructor(options: IFrameManagerOptions) {
		this.render = options.render || new Function();
		this.update = options.update || new Function();

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
		let newTime = Date.now();
    	let frameTime = newTime - this.currentTime;

    	this.currentTime = newTime;
    	this.accumulator += frameTime;

    	while (this.accumulator >= this.timeDiff)
	    {
	    	this.update();
	    	this.accumulator -= this.timeDiff;
	    }

	    this.update();
	    this.render();
	}
}