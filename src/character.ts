import * as PIXI from "pixi.js";
import { World } from "./world";

function MergeCells(cells: ICell[], i: number, j: number,
                    xIndex: number, yIndex: number, xBorderIndex: number, yBorderIndex: number) {
    // Add newly created cell to the queue and remove the merged cells

    cells.push({
        x: cells[xIndex].x,
        y: cells[yIndex].y,
        xBorder: cells[xBorderIndex].xBorder,
        yBorder: cells[yBorderIndex].yBorder,
    });

    cells.splice(i, 1);

    // Remove the second cell based on the index of the first cell

    if (i > j) {
        cells.splice(j, 1);
    } else {
        cells.splice(j - 1, 1);
    }
}
interface ICell {
    x: number;
    y: number;
    xBorder: number;
    yBorder: number;
}

interface ICharacterOptions {
    tileSize?: number;
    graphics?: PIXI.Graphics;
    texture?: PIXI.Texture;
}

export class Character extends PIXI.Sprite {
    acceleration: number;
    yVelocity: number;
    xVelocity: number;
    friction: number;
    size: number;

    constructor(options: ICharacterOptions) {

        let texture = options.texture;

        if (!texture) {
            let graphics = options.graphics;

            if (!graphics) {
                graphics = new PIXI.Graphics();

                const size = options.tileSize || 50;

                graphics.clear();
                graphics.beginFill(0xFF0000);
                graphics.lineStyle(1, 0xFFFFFF);
                graphics.drawRect(0, 0, size, size);
                graphics.endFill();
            }

            texture = graphics.generateCanvasTexture();
        }

        super(texture);

        this.position.x = 0;
        this.position.y = 0;
        this.acceleration = 0.5;
        this.yVelocity = 0;
        this.xVelocity = 0;
        this.friction = 0.9;
        this.size = options.tileSize || 50;
    }
    Move(dx: number, dy: number) {
        this.xVelocity += (dx * this.acceleration);
        this.yVelocity += (dy * this.acceleration);

        this.xVelocity *= this.friction;
        this.yVelocity *= this.friction;

        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }
    TileX(tileSize: number) {
        return Math.floor(((this.xBorder + this.x) / 2) / tileSize);
    }
    TileY(tileSize: number) {
        return Math.floor(((this.yBorder + this.y) / 2) / tileSize);
    }
    DetectCollisions(world: World) {
        const ts = world.tileSize;
        const grid = world.grid;

        const xMin = Math.floor(this.x / ts);
        const xMax = Math.floor(this.xBorder / ts);

        const yMin = Math.floor(this.y / ts);
        const yMax = Math.floor(this.yBorder / ts);

        const cells = [];

        // Retrieve surrouding cells

        for (let i = xMin; i <= xMax; i++) {
            for (let j = yMin; j <= yMax; j++) {
                if (grid[i] && grid[i][j] === 1) {
                    cells.push({
                        x: i * ts,
                        y: j * ts,
                        xBorder: (i * ts) + ts,
                        yBorder: (j * ts) + ts,
                    });
                }
            }
        }

        let merged = true;

        // While there is still tiles that have recently been merged, loop through the cells

        while (merged) {
            merged = false;
            for (let i = 0; i < cells.length; i++) {
                for (let j = 0; j < cells.length; j++) {

                    // If the cells we are merging are the same cell, skip

                    if (i === j) {
                        continue;
                    }

                    const xEquals = cells[i].x === cells[j].x;
                    const yEquals = cells[i].y === cells[j].y;
                    const xBorderEquals = cells[i].xBorder === cells[j].xBorder;
                    const yBorderEquals = cells[i].yBorder === cells[j].yBorder;

                    // Merge cells together as long as the resulting cell is a rectangle

                    if (yEquals && yBorderEquals) {
                        if (cells[i].x === cells[j].xBorder) {
                            MergeCells(cells, i, j, j, i, i, i);
                            merged = true;
                            break;
                        }

                        if (cells[j].x === cells[i].xBorder) {
                            MergeCells(cells, i, j, i, i, j, i);
                            merged = true;
                            break;
                        }
                    }

                    if (xEquals && xBorderEquals) {
                        if (cells[i].y === cells[j].yBorder) {
                            MergeCells(cells, i, j, i, j, i, i);
                            merged = true;
                            break;
                        }

                        if (cells[j].y === cells[i].yBorder) {
                            MergeCells(cells, i, j, i, i, i, j);
                            merged = true;
                            break;
                        }
                    }
                }
            }
        }

        for (const cell of cells) {
            const itemX = cell.x;
            const itemY = cell.y;
            const itemXBorder = cell.xBorder;
            const itemYBorder = cell.yBorder;

            // Collision Detection: check if items are colliding

            if (itemXBorder > this.x && itemX < this.xBorder && itemYBorder > this.y && itemY < this.yBorder) {

                // Collision Response: response to the collision by moving the player
                //
                // Take into consideration the possibility of simultaneous
                // vertical and horizontal velocity

                if (this.yVelocity > 0) {
                    if (this.xVelocity > 0) {
                        if (this.xBorder - itemX > this.yBorder - itemY) {
                            this.y = itemY - this.height;
                            this.yVelocity = 0;
                        } else {
                            this.x = itemX - this.width;
                            this.xVelocity = 0;
                        }
                    } else if (this.xVelocity < 0) {
                        if (itemXBorder - this.x > this.yBorder - itemY) {
                            this.y = itemY - this.height;
                            this.yVelocity = 0;
                        } else {
                            this.x = itemXBorder;
                            this.xVelocity = 0;
                        }
                    } else {
                        this.y = itemY - this.height;
                        this.yVelocity = 0;
                    }
                } else if (this.yVelocity < 0) {
                    if (this.xVelocity > 0) {
                        if (this.xBorder - itemX > itemYBorder - this.y) {
                            this.y = itemYBorder;
                            this.yVelocity = 0;
                        } else {
                            this.x = itemX - this.width;
                            this.xVelocity = 0;
                        }
                    } else if (this.xVelocity < 0) {
                        if (itemXBorder - this.x > itemYBorder - this.y) {
                            this.y = itemYBorder;
                            this.yVelocity = 0;
                        } else {
                            this.x = itemXBorder;
                            this.xVelocity = 0;
                        }
                    } else {
                        this.y = itemYBorder;
                        this.yVelocity = 0;
                    }
                } else if (this.xVelocity > 0) {
                    this.x = itemX - this.width;
                    this.xVelocity = 0;
                } else if (this.xVelocity < 0) {
                    this.x = itemXBorder;
                    this.xVelocity = 0;
                }
            }
        }
    }
    get x() {
        return this.position.x;
    }
    set x(value: number) {
        this.position.x = value;
    }
    get y() {
        return this.position.y;
    }
    set y(value: number) {
        this.position.y = value;
    }
    get xBorder() {
        return this.position.x + this.width;
    }
    get yBorder() {
        return this.position.y + this.height;
    }
}
