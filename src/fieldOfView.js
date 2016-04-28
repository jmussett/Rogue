import {ViewType} from 'viewType'

function newVec (dx, dy) {
	return {
		dx: dx,
		dy: dy
	}
};

export class FieldOfView {
	constructor(viewType) {
		this.cells = [];

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
			newVec(-1, -1)
		]
	}
	Update(tileX, tileY, range) {
		if (this.viewType === 0) {
			for (let row in this.lightMap) {
				for (let collumn in this.lightMap[row]) {
					let alpha = this.lightMap[row][collumn].seen ? this.fogAlpha : 1

					this.lightMap[row][collumn].alpha = alpha;
				}
			}

			for (let i = 0; i < this.directions.length; i++) {
				let dir = this.directions[i];
	        	this.CastLight(1, 1, 0, 0, dir.dx, dir.dy, 0, tileX, tileY, range);
				this.CastLight(1, 1, 0, dir.dx, 0, 0, dir.dy, tileX, tileY, range);
			}

			this.lightMap[tileX][tileY].alpha = 0;
		}
	}
	CastLight(row, start, end, xx, xy, yx, yy, tileX, tileY, range) {
		let newStart = 0;
	    if (start < end) {
	        return;
	    }

		let blocked = false;
		for (let distance = row; distance <= range; distance++) {
			let deltaY = -distance;
			for (let deltaX = -distance; deltaX <= 0; deltaX++) {
	            let leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
	            let rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

	            if (start < rightSlope) {
	                continue;
	            } 

	            if (end > leftSlope) {
	                break;
	            }

				let currentX = tileX + (deltaX * xx) + (deltaY * xy);
	            let currentY = tileY + (deltaX * yx) + (deltaY * yy);

	            let currentTile = this.lightMap[currentX][currentY]

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

	            let absDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

	            if (!blocked && absDistance <= range) {
	            	let alpha = absDistance / range;
	            	let seen = currentTile.seen;

	            	if (alpha >= this.fogAlpha) {
	            		if (seen) {
	            			alpha = this.fogAlpha;
	            		} else {
	            			alpha = 1;
	            		}
	            	} else {
	            		this.lightMap[currentX][currentY].seen = true;
	            	}

		        	this.lightMap[currentX][currentY].alpha = alpha;
		        	
	            }
			}

			if (blocked) break;
		}
	}
	CreateFOV(grid) {
        for (var i = 0; i < grid.length; i++) {
        	this.lightMap[i] = [];
        	for (var j = 0; j < grid[i].length; j++) {
				this.lightMap[i][j] = {
					alpha: 1,
					seen: false,
					wall: grid[i][j] === 1
				}

				if (this.viewType === 1) {
					this.lightMap[i][j].alpha = this.lightMap[i][j].wall ? 1 : 0;
				}
        	}
        }
	}
	UpdateFOV(grid) {
		if (grid.length === this.lightMap.length) {
			for (var i = 0; i < grid.length; i++) {
				if (grid[i].length === this.lightMap[i].length) {
					for (var j = 0; j < grid[i].length; j++) {
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