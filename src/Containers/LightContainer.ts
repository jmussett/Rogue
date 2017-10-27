import { FieldOfView } from "../fieldOfView";

interface ILightContainerOptions {
    showFOV: boolean;
    tileSize: number;
}

export default class LightContainer extends PIXI.particles.ParticleContainer {
    public range: number;

    private fov: FieldOfView;
    private created: boolean = false;
    private tileSize: number;
    private lightIndexes: PIXI.Sprite[][];
    private currentRange: number;
    private previousTime: number;
    private currentX: number;
    private currentY: number;
    constructor(options: ILightContainerOptions) {
        super(1500000, {
            alpha: true,
        });

        this.fov = new FieldOfView(options.showFOV ? 0 : 1);

        this.tileSize = options.tileSize;
        this.range = 40;
        this.currentRange = this.range;
        this.previousTime = Date.now();
    }
    Render(grid: number[][]) {
        if (this.created) {
            this.fov.UpdateFOV(grid);

            for (let i = 0; i < this.fov.lightMap.length; i++) {
                for (let j = 0; j < this.fov.lightMap[i].length; j++) {
                    this.lightIndexes[i][j].alpha = this.fov.lightMap[i][j].alpha;
                }
            }

            return;
        }

        this.fov.CreateFOV(grid);

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
                this.addChild(tile);
            }
        }
    }
    Update(xPosition: number, yPosition: number) {
        const rangeChanged = this.currentRange !== this.range;
        const latestTime = Date.now();

        const timeDiff = latestTime - this.previousTime;

        if (timeDiff >= 100) {
            this.previousTime = latestTime;

            if (rangeChanged) {
                this.currentRange = this.range;
            } else {
                this.range = this.currentRange;
            }
        } else {
            this.range = this.currentRange;
        }

        if ((this.currentX !== xPosition || this.currentY !== yPosition) || rangeChanged)  {
            this.currentX = xPosition;
            this.currentY = yPosition;
            this.fov.Update(xPosition, yPosition, this.currentRange);

            for (let i = 0; i < this.fov.lightMap.length; i++) {
                for (let j = 0; j < this.fov.lightMap[i].length; j++) {
                    this.lightIndexes[i][j].alpha = this.fov.lightMap[i][j].alpha;
                }
            }
        }
    }
}
