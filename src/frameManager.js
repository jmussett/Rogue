export class FrameManager {
	constructor(options) {
		this.render = options.render || new Function();
		this.update = options.update || new Function();

		this.currentTime = Date.now();
		this.accumulator = 0.0;
		this.timeDiff = 5;
	}
	Start() {
		this.currentTime = Date.now();

		function run(fm) {
			requestAnimationFrame(run.bind(null, fm));

			fm.Step();
		}

		run(this);
	}
	Step() {
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