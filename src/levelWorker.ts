import {LevelGenerator} from './levelGenerator'

const worker: Worker = self as any;

worker.onmessage = function (e) {
	if (e.data.step = "generate") {
		let lg = new LevelGenerator(e.data.options);
		lg.Generate((grid: number[][]) => {
			worker.postMessage(grid);
		});
	}
	
}