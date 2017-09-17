import PIXI from 'pixi.js'
import {Player} from 'player'
import {FieldOfView} from 'fieldOfView'
import LevelWorker from 'worker!./levelWorker'

export class World extends PIXI.Container {
    constructor(options) {
        super();

        this.tileSize = options.tileSize || 50;
        this.showPlayer = options.showPlayer == undefined ? true : options.showPlayer;

        this.player = new Player({
            tileSize: options.tileSize
        });

        this.player.x = options.xPosition * this.tileSize;
        this.player.y = options.yPosition * this.tileSize;

        this.light = new PIXI.ParticleContainer(1500000, {
            alpha: true
        });

        this.fov = new FieldOfView(options.showFOV ? 0 : 1);

        this.range = 40;

        this.minRange = 2;
        this.maxRange = 50;
        this.currentRange = this.range;
        this.previousTime = Date.now();

        if (this.showPlayer) {
            this.addChild(this.player);
        }

        this.addChild(this.light);

        this.levelWorker = new LevelWorker();

        this.levelWorker.onmessage = this.RenderStep.bind(this);
        this.levelWorker.postMessage({
            step: 'generate', 
            options: {
                animate: options.animate || false,
                animationDelay: options.animationDelay || 10,
                seed: options.seed,
                roomAttempts: options.roomAttempts || 200, 
                width: options.width || 30, 
                height: options.height || 30,
                wallWidth: options.wallWidth || 1,
                mazeWidth: options.mazeWidth || 2
            }
        });
    }
    RenderStep(e) {
        this.grid = e.data;

        if (this.created) {

            this.fov.UpdateFOV(e.data);

            for (var i = 0; i < this.fov.lightMap.length; i++) {
                for (var j = 0; j < this.fov.lightMap[i].length; j++) {
                    this.lightIndexes[i][j].alpha = this.fov.lightMap[i][j].alpha;
                }
            }
        } else {
            this.fov.CreateFOV(e.data);

            this.created = true;

            let ts = this.tileSize;

            let tileGraphics = new PIXI.Graphics()
            tileGraphics.beginFill(0x000000);
            tileGraphics.drawRect(0, 0, ts, ts);
            tileGraphics.endFill();

            let tileTexture = tileGraphics.generateTexture();

            this.lightIndexes = [];
            for (var i = 0; i < this.fov.lightMap.length; i++) {
                this.lightIndexes[i] = [];
                for (var j = 0; j < this.fov.lightMap[i].length; j++) {
                    let tile = new PIXI.Sprite(tileTexture);

                    tile.position.x = i * ts;
                    tile.position.y = j * ts;
                    tile.alpha = this.fov.lightMap[i][j].alpha;

                    this.lightIndexes[i][j] = tile;
                    this.light.addChild(tile);
                }
            }
        }
    }
    Update(IM) {
        if (this.grid) {
            let dy = IM.Action('Vertical');
            let dx = IM.Action('Horizontal');
            
            if (this.showPlayer) {
                this.player.Move(dx, dy);
                this.player.DetectCollisions(this);
            }

            let rangeChanged = this.currentRange != this.range;
            let latestTime = Date.now();

            let timeDiff = latestTime - this.previousTime;
            
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

            var tileX = this.player.TileX(this.tileSize);
            var tileY = this.player.TileY(this.tileSize);

            if ((this.currentX != tileX || this.currentY != tileY) || rangeChanged)  {
                this.currentX = tileX;
                this.currentY = tileY;
                this.fov.Update(tileX, tileY, this.currentRange);

                for (var i = 0; i < this.fov.lightMap.length; i++) {
                    for (var j = 0; j < this.fov.lightMap[i].length; j++) {
                        this.lightIndexes[i][j].alpha = this.fov.lightMap[i][j].alpha;
                    }
                }
            }
        }
    }
}