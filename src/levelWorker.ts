import {LevelGenerator} from "./levelGenerator";

const worker: Worker = self as any;

let lg: LevelGenerator;

worker.onmessage = (e) => {
    switch (e.data.message) {
        case "generate":
            lg = new LevelGenerator(e.data.options);
            lg.Generate((grid: number[][]) => {
                worker.postMessage({
                    message: "step",
                    grid: grid,
                });
            });

            worker.postMessage({
                message: "complete",
            });

            break;
        case "rooms":
            worker.postMessage({
                message: "rooms",
                rooms: lg.rooms,
            });
            break;
    }
};
