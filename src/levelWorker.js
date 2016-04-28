import {LevelGenerator} from 'levelGenerator'

self.onmessage = function (e) {
	if (e.data.step = "generate") {
		let lg = new LevelGenerator(e.data.options);
		lg.Generate((grid) => {
			self.postMessage(grid);
		});
	}
	
}