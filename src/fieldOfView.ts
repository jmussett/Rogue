interface IVector {
    dx: number;
    dy: number;
}

interface ILightNode {
    alpha: number;
    wall: boolean;
    seen: boolean;
}

function newVec(dx: number, dy: number) : IVector {
    return {
        dx: dx,
        dy: dy,
    };
}

export class FieldOfView {
    viewType: number;
    fogAlpha: number;
    directions: IVector[];
    lightMap: ILightNode[][];

    constructor(viewType: number) {
        this.viewType = viewType && viewType !== 0 ? 1 : 0;

        this.fogAlpha = 0.8;

        this.lightMap = [];

        this.directions = [
            newVec(0, 1),
            newVec(0, -1),
            newVec(1, 0),
            newVec(1, 1),
            newVec(1, -1),
            newVec(-1, 0),
            newVec(-1, 1),
            newVec(-1, -1),
        ];
    }
    Update(tileX: number, tileY: number, range: number) {
        if (this.viewType === 0) {
            for (const row of this.lightMap) {
                for (const lightNode of row) {
                    const alpha = lightNode.seen ? this.fogAlpha : 1;

                    lightNode.alpha = alpha;
                }
            }

            for (const dir of this.directions) {
                this.CastLight(1, 1, 0, 0, dir.dx, dir.dy, 0, tileX, tileY, range);
                this.CastLight(1, 1, 0, dir.dx, 0, 0, dir.dy, tileX, tileY, range);
            }

            this.lightMap[tileX][tileY].alpha = 0;
        }
    }
    CastLight(row: number, start: number, end: number,
              xx: number, xy: number, yx: number, yy: number,
              tileX: number, tileY: number, range: number) {
        let newStart = 0;
        if (start < end) {
            return;
        }

        let blocked = false;
        for (let distance = row; distance <= range; distance++) {
            const deltaY = -distance;
            for (let deltaX = -distance; deltaX <= 0; deltaX++) {
                const leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
                const rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

                if (start < rightSlope) {
                    continue;
                }

                if (end > leftSlope) {
                    break;
                }

                const currentX = tileX + (deltaX * xx) + (deltaY * xy);
                const currentY = tileY + (deltaX * yx) + (deltaY * yy);

                const currentTile = this.lightMap[currentX][currentY];

                if (blocked) {
                    if (currentTile.wall) {
                        newStart = rightSlope;
                        continue;
                    } else {
                        blocked = false;
                        start = newStart;
                    }
                } else {
                    if (currentTile.wall && distance < range) {
                        blocked = true;
                        this.CastLight(distance + 1, start, leftSlope, xx, xy, yx, yy, tileX, tileY, range);
                        newStart = rightSlope;
                    }
                }

                const absDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

                if (!blocked && absDistance <= range) {
                    let alpha = absDistance / range;
                    const seen = currentTile.seen;

                    if (alpha >= this.fogAlpha) {
                        alpha = seen ? this.fogAlpha : 1;
                    } else {
                        this.lightMap[currentX][currentY].seen = true;
                    }

                    this.lightMap[currentX][currentY].alpha = alpha;
                }
            }

            if (blocked) {
                break;
            }
        }
    }
    CreateFOV(grid: number[][]) {
        for (let i = 0; i < grid.length; i++) {
            this.lightMap[i] = [];
            for (let j = 0; j < grid[i].length; j++) {
                this.lightMap[i][j] = {
                    alpha: 1,
                    seen: false,
                    wall: grid[i][j] === 1,
                };

                if (this.viewType === 1) {
                    this.lightMap[i][j].alpha = this.lightMap[i][j].wall ? 1 : 0;
                }
            }
        }
    }
    UpdateFOV(grid: number[][]) {
        if (grid.length === this.lightMap.length) {
            for (let i = 0; i < grid.length; i++) {
                if (grid[i].length === this.lightMap[i].length) {
                    for (let j = 0; j < grid[i].length; j++) {
                        this.lightMap[i][j].wall = grid[i][j] === 1;

                        if (this.viewType === 1) {
                            this.lightMap[i][j].alpha = this.lightMap[i][j].wall ? 1 : 0;
                        }
                    }
                }
            }
        }
    }
}
