import PIXI from 'pixi.js'

function MergeCells(cells, i, j, xIndex, yIndex, xBorderIndex, yBorderIndex) {
    
    // Add newly created cell to the queue and remove the merged cells

    cells.push({
        x: cells[xIndex].x,
        y: cells[yIndex].y,
        xBorder: cells[xBorderIndex].xBorder,
        yBorder: cells[yBorderIndex].yBorder
    });

    cells.splice(i, 1);

    // Remove the second cell based on the index of the first cell

    if (i > j) {
        cells.splice(j, 1);
    } else {
        cells.splice(j - 1, 1);
    }
}

export class Player extends PIXI.Graphics {
    constructor() {
        super();
        this.position.x = 0;
        this.position.y = 0;
        this.acceleration = 0.5;
        this.yVelocity = 0;
        this.xVelocity = 0;
        this.friction = 0.9;
        this.size = 50;
        this.UpdateColor(0xFF0000);
    }
    UpdateColor(color) {
        this.clear();
        this.beginFill(color);
        this.lineStyle(1, 0xFFFFFF);
        this.drawRect(this.x, this.y, this.size, this.size);
        this.endFill();
    }
    Move (dx, dy) {
        this.xVelocity += (dx * this.acceleration);
        this.yVelocity += (dy * this.acceleration);

        this.xVelocity *= this.friction;
        this.yVelocity *= this.friction;

        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }
    TileX(tileSize) {
        return Math.floor(((this.xBorder + this.x) / 2) / tileSize)
    }
    TileY(tileSize) {
        return Math.floor(((this.yBorder + this.y) / 2) / tileSize)
    }
    DetectCollisions(world) {
        let ts = world.tileSize;
        let grid = world.grid;

        let xMin = Math.floor(this.x / ts);
        let xMax = Math.floor(this.xBorder / ts);

        let yMin = Math.floor(this.y / ts);
        let yMax = Math.floor(this.yBorder / ts);

        let cells = [];

        // Retrieve surrouding cells

        for (let i = xMin; i <= xMax; i++) {
            for(let j = yMin; j <= yMax; j++) {
                if (grid[i] && grid[i][j] === 1) {
                    cells.push({
                        x: i * ts,
                        y: j * ts,
                        xBorder: (i * ts) + ts,
                        yBorder: (j * ts) + ts
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

                    let xEquals = cells[i].x === cells[j].x;
                    let yEquals = cells[i].y === cells[j].y;
                    let xBorderEquals = cells[i].xBorder === cells[j].xBorder;
                    let yBorderEquals = cells[i].yBorder === cells[j].yBorder;

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

        for (let i = 0; i < cells.length; i++) {
            let itemX = cells[i].x;
            let itemY = cells[i].y;
            let itemXBorder = cells[i].xBorder;
            let itemYBorder = cells[i].yBorder;

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
    set x(value) {
        this.position.x = value;
    }
    get y() {
        return this.position.y;
    }
    set y(value) {
        this.position.y = value;
    }
    get xBorder() {
        return this.position.x + this.width;
    }
    get yBorder() {
        return this.position.y + this.height;
    }
}