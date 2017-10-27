import LevelWorker = require("worker-loader!./LevelGeneration/levelWorker");

import LightContainer from "./Containers/LightContainer";

import EnemyContainer from "./Containers/EnemyContainer";
import { Character } from "./character";
import { InputManager } from "./input/inputManager";

interface IWorldOptions {
    tileSize?: number;
    showPlayer?: boolean;
    xPosition?: number;
    yPosition?: number;
    showFOV?: boolean;
    animate?: boolean;
    animationDelay?: number;
    seed?: string;
    width?: number;
    height?: number;
    wallWidth?: number;
    mazeWidth?: number;
    roomAttempts?: number;
    loadingContent?: PIXI.Container;
}

export class World extends PIXI.Container {
    stage: PIXI.Container;
    player: Character;
    light: LightContainer;
    enemies: EnemyContainer;
    levelWorker: LevelWorker;
    tileSize: number;
    showPlayer: boolean;
    grid: number[][];
    loadingContent?: PIXI.Container;

    constructor(options: IWorldOptions) {
        super();

        this.tileSize = options.tileSize || 50;
        this.showPlayer = options.showPlayer === undefined ? true : options.showPlayer;

        this.player = new Character({
            tileSize: options.tileSize,
        });

        this.player.x = options.xPosition * this.tileSize;
        this.player.y = options.yPosition * this.tileSize;

        this.light = new LightContainer({showFOV: options.showFOV, tileSize: options.tileSize});
        this.enemies = new EnemyContainer({tileSize: options.tileSize});

        this.stage = new PIXI.Container();

        this.stage.addChild(this.enemies);
        this.stage.addChild(this.light);

        if (this.showPlayer) {
            this.stage.addChild(this.player);
        }

        this.stage.visible = false;

        this.addChild(this.stage);

        if (options.loadingContent) {
            this.loadingContent = options.loadingContent;
        }

        this.levelWorker = new LevelWorker();

        this.levelWorker.onmessage = (e) => {
            switch (e.data.message) {
                case "step":
                    this.grid = e.data.grid;

                    if (options.animate) {
                        this.light.Render(e.data.grid);

                        this.FinishLoading();
                    }

                    break;
                case "complete":
                    this.levelWorker.postMessage({message: "metadata"});

                    break;
                case "metadata":
                    const metadata = e.data.metadata;

                    this.enemies.Render(metadata.rooms, metadata.wallWidth, metadata.mazeWidth);
                    this.light.Render(this.grid);

                    this.FinishLoading();

                    break;
            }
        };

        this.levelWorker.postMessage({
            message: "generate",
            options: {
                animate: options.animate || false,
                animationDelay: options.animationDelay || 10,
                seed: options.seed,
                roomAttempts: options.roomAttempts || 200,
                width: options.width || 30,
                height: options.height || 30,
                wallWidth: options.wallWidth || 1,
                mazeWidth: options.mazeWidth || 2,
            },
        });
    }
    Update(IM: InputManager) {
        if (!this.grid || !this.stage.visible) {
            return;
        }

        const dy = IM.Action("Vertical");
        const dx = IM.Action("Horizontal");

        if (this.showPlayer) {
            this.player.Move(dx, dy);
            this.player.DetectCollisions(this);
        }

        const tileX = this.player.TileX(this.tileSize);
        const tileY = this.player.TileY(this.tileSize);

        this.light.Update(tileX, tileY);
    }
    private FinishLoading() {
        if (this.loadingContent) {
            this.loadingContent.visible = false;
        }

        this.stage.visible = true;
    }
}
