import * as PIXI from "pixi.js";
import {Player} from "./player";
import {FieldOfView} from "./fieldOfView";
import { InputManager } from "./input/inputManager";

import LevelWorker = require("worker-loader!./levelWorker");

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
    player: Player;
    light: PIXI.particles.ParticleContainer;
    levelWorker: LevelWorker;
    lightIndexes: PIXI.Sprite[][];
    fov: FieldOfView;
    tileSize: number;
    showPlayer: boolean;
    range: number;
    minRange: number;
    maxRange: number;
    currentRange: number;
    previousTime: number;
    created: boolean;
    currentX: number;
    currentY: number;
    grid: number[][];
    loadingContent?: PIXI.Container;

    constructor(options: IWorldOptions) {
        super();

        this.tileSize = options.tileSize || 50;
        this.showPlayer = options.showPlayer === undefined ? true : options.showPlayer;

        this.range = 40;

        this.minRange = 2;
        this.maxRange = 50;
        this.currentRange = this.range;
        this.previousTime = Date.now();

        this.player = new Player({
            tileSize: options.tileSize,
        });

        this.player.x = options.xPosition * this.tileSize;
        this.player.y = options.yPosition * this.tileSize;

        this.light = new PIXI.particles.ParticleContainer(1500000, {
            alpha: true,
        });

        this.fov = new FieldOfView(options.showFOV ? 0 : 1);

        this.stage = new PIXI.Container();

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

        this.levelWorker.onmessage = this.RenderStep.bind(this);
        this.levelWorker.postMessage({
            step: "generate",
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
    RenderStep(e: { data: number[][]}) {
        this.grid = e.data;

        if (this.created) {
            this.fov.UpdateFOV(e.data);

            for (let i = 0; i < this.fov.lightMap.length; i++) {
                for (let j = 0; j < this.fov.lightMap[i].length; j++) {
                    this.lightIndexes[i][j].alpha = this.fov.lightMap[i][j].alpha;
                }
            }

            return;
        }

        this.fov.CreateFOV(e.data);

        this.created = true;

        const ts = this.tileSize;

        const tileGraphics = new PIXI.Graphics();
        tileGraphics.beginFill(0x000000);
        tileGraphics.drawRect(0, 0, ts, ts);
        tileGraphics.endFill();

        const tileTexture = tileGraphics.generateCanvasTexture();

        this.lightIndexes = [];
        for (let i = 0; i < this.fov.lightMap.length; i++) {
            this.lightIndexes[i] = [];
            for (let j = 0; j < this.fov.lightMap[i].length; j++) {
                const tile = new PIXI.Sprite(tileTexture);

                tile.position.x = i * ts;
                tile.position.y = j * ts;
                tile.alpha = this.fov.lightMap[i][j].alpha;

                this.lightIndexes[i][j] = tile;
                this.light.addChild(tile);
            }
        }

        if (this.loadingContent) {
            this.loadingContent.visible = false;
        }

        this.stage.visible = true;
    }
    Update(IM: InputManager) {
        if (!this.grid) {
            return;
        }

        const dy = IM.Action("Vertical");
        const dx = IM.Action("Horizontal");

        if (this.showPlayer) {
            this.player.Move(dx, dy);
            this.player.DetectCollisions(this);
        }

        const rangeChanged = this.currentRange !== this.range;
        const latestTime = Date.now();

        const timeDiff = latestTime - this.previousTime;

        if (timeDiff >= 100) {
            this.previousTime = latestTime;

            if (rangeChanged && this.range <= this.maxRange && this.range >= this.minRange) {
                this.currentRange = this.range;
            } else {
                this.range = this.currentRange;
            }
        } else {
            this.range = this.currentRange;
        }

        const tileX = this.player.TileX(this.tileSize);
        const tileY = this.player.TileY(this.tileSize);

        if ((this.currentX !== tileX || this.currentY !== tileY) || rangeChanged)  {
            this.currentX = tileX;
            this.currentY = tileY;
            this.fov.Update(tileX, tileY, this.currentRange);

            for (let i = 0; i < this.fov.lightMap.length; i++) {
                for (let j = 0; j < this.fov.lightMap[i].length; j++) {
                    this.lightIndexes[i][j].alpha = this.fov.lightMap[i][j].alpha;
                }
            }
        }
    }
}
