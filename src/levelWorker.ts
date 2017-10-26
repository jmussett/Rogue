import {LevelGenerator} from "./levelGenerator";

const worker: Worker = self as any;

worker.onmessage = (e) => {
    if (e.data.step === "generate") {
        const lg = new LevelGenerator(e.data.options);
        lg.Generate((grid: number[][]) => {
            worker.postMessage(grid);
        });
    }
};
