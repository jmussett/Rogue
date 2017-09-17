import seedrandom from 'seedrandom'

let random = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class LevelGenerator {
	 constructor(options) {
	 	if (options.seed) {
		 	seedrandom(options.seed, { global: true});
	 	}

	 	this.width = options.width || 25;
	 	this.height = options.height || 25;
	 	this.roomAttempts = options.roomAttempts || 50;
		this.maxSize = options.maxSize || 8;
		this.minSize = options.minSize || 5;
		this.windyness = options.windyness || 100;
		this.wallWidth = options.wallWidth || 1;
		this.mazeWidth = options.mazeWidth || 2;
		this.minDoors = options.minDoors || 1;
		this.maxDoors = options.maxDoors || 4;
		this.animate = options.animate || false;
		this.animationDelay = options.animationDelay || 10;
	 }
	 Generate(updateFrame) {
	 	this.updateFrame = updateFrame;

	 	this.InitGrid();

	 	console.log("Adding rooms...");

		this.AddRooms();

		console.log("Creating maze...");
		
		this.CreateMaze(0, 0);

		console.log("Opening rooms...");

		this.OpenRooms();

		console.log("Removing dead ends...");

		this.RemoveDeadEnds();

		console.log("Removing slack...");

		this.ReduceSlack();

		console.log("Removing maze walls...");

		this.RemoveMazeWalls();

		console.log("Removing excess walls...");

		this.RemoveExcessWall();

		console.log("Removing artifacts...");

		this.RemoveArtifacts();

		this.FinalFrame();
	 }
	 UpdateFrame() {
	 	if (this.updateFrame && this.animate) {
	 		this.updateFrame(this.grid);

			var start = new Date().getTime();
			var end = start;
			while(end < start + this.animationDelay) {
				end = new Date().getTime();
			}
		 }
	 }
	 FinalFrame() {
	 	if (this.updateFrame) {
	 		this.updateFrame(this.grid);
	 	}
	 }
	 InitGrid() {
	 	this.grid = [];
	 	this.virtualGrid = [];

	 	let actualWidth = this.wallWidth + this.width * (this.wallWidth + this.mazeWidth);
	 	let actualHeight = this.wallWidth + this.height * (this.wallWidth + this.mazeWidth);

	 	for (let i = 0; i < this.width ; i++) {
			this.virtualGrid[i] = [];
			for (let j = 0; j < this.height; j++) {
				this.virtualGrid[i][j] = 1;
			}
		}

		for (let i = 0; i < actualWidth ; i++) {
			this.grid[i] = [];
			for (let j = 0; j < actualHeight; j++) {
				this.grid[i][j] = 1;
			}
		}
	 }
	 AddRooms() {
	 	this.rooms = [];

	 	for (let i = 0; i < this.roomAttempts; i++) {
	 		let roomWidth = random(this.minSize, this.maxSize);
	 		let roomHeight = random(this.minSize, this.maxSize);

	 		let x = random(1, this.width - roomWidth - 1);
	 		let y = random(1, this.height - roomHeight - 1);

	 		let xBorder = x + roomWidth;
			let yBorder = y + roomHeight;

			let overlaps = false;

			for (let room of this.rooms) {
				if (room.x <= xBorder
					&& room.xBorder >= x
					&& room.y <= yBorder
					&& room.yBorder >= y) {
				  overlaps = true;
				  break;
				}
			}

			if(overlaps) continue;

			let newRoom = {
				x: x,
				y: y,
				xBorder: xBorder,
				yBorder: yBorder
			};

			this.rooms.push(newRoom);
			this.DrawRoom(newRoom)
	 	}
	 }
	 CreateMaze(x, y) {
		let cells = [];
		let lastDir;

		let startingCell = {
			x: x,
			y: y
		}

		this.DrawCell(startingCell);

		cells.push(startingCell);

		while(cells.length > 0) {
			let cell = cells[cells.length - 1];

			let directions = this.GetDirections(cell, 1);

			if (directions.length > 0) {
				let dir;

				let hasLast = !!lastDir && directions.some((dir) => {
					return dir.x === lastDir.x && dir.y === lastDir.y;
				})

				if (hasLast && random(0, 100) > this.windyness) {
					dir = lastDir;
				} else {
					let index = random(0, directions.length - 1);
					dir = directions[index];
				}

				this.DrawCellTo(cell, dir);

				this.UpdateFrame();

				cells.push({
					x: cell.x + dir.x,
					y: cell.y + dir.y
				});

				lastDir = dir;
			} else {
				// Remove last cell in the current branch
				lastDir = null;
				cells.pop();
			}
	    }
	 }
	 OpenRooms() {
	 	if (!this.rooms) return;

	 	for(let room of this.rooms) {
			let allDirections = [];
			allDirections.push({ x: 0, y: -1 });
			allDirections.push({ x: 0, y: 1 });
			allDirections.push({ x: -1, y: 0 });
			allDirections.push({ x: 1, y: 0 });

			let maxDoorsActual = this.maxDoors < 4 ? this.maxDoors : 4;
			let numDoors = random(this.minDoors, maxDoorsActual);

			let directions = [];
			let indexes = [];

			while (directions.length < numDoors) {
				let newRandom = random(0, 3);

				if (!indexes.includes(newRandom)) {
					indexes.push(newRandom);
					directions.push(allDirections[newRandom]);
				}
			}

			for (let dir of directions) {
				var x = dir.x === 1 ? room.xBorder - 1 
							: dir.x === -1 ? room.x 
							: random(room.x + 1, room.xBorder - 2);

				var y = dir.y === 1 ? room.yBorder - 1 
							: dir.y === -1 ? room.y 
							: random(room.y + 1, room.yBorder - 2);

				this.DrawWallTo({
					x: x,
					y: y
				}, dir, 0);
			}
		}
	 }
	 ReduceSlack() {
	 	var slackLeft = true;

	 	while(slackLeft) {
	 		slackLeft = false;

	 		for (let x = 0; x < this.virtualGrid.length; x++) {
				for (let y = 0; y < this.virtualGrid[x].length; y++) {
					if (this.virtualGrid[x][y] === 0) {
						var startCell = {x: x, y: y};
						var endCell = undefined;
						var openings = this.CellWalls(startCell, 0);

						// Is the cell a corner
						if (openings.length === 2 && Math.abs(openings[0].x) !== Math.abs(openings[1].x)) {
							var inLoop = true;
							var offset = 1;

							var cells = [];
							var crossings = [];

							var loopDirIndex = 0;
							var cornerDirIndex = 1;

							var firstAttempt = true;

							var isValid = false;

							// Loop through all cells in slack until a corner is reached
							while(inLoop) {
								let xDiff = openings[loopDirIndex].x * offset;
								let yDiff = openings[loopDirIndex].y * offset;
								let nextCell = {
									x: x + xDiff,
									y: y + yDiff
								};

								let nextOpenings = this.CellWalls(nextCell, 0);

								// If the cell does not have 2 or 3 openings, then it is no longer a slack
								if(nextOpenings.length === 2) {
									// If the cell is not a corner, continue to next cell.
									if (Math.abs(nextOpenings[0].x) === Math.abs(nextOpenings[1].x)) {
										offset++;
										cells.push(nextCell);
									} else {
										// If the cell is a corner, check that its a corner facing the same direction as the start cell.
										if ((nextOpenings[1].x == openings[cornerDirIndex].x || nextOpenings[0].x == openings[cornerDirIndex].x) 
											&& (nextOpenings[1].y == openings[cornerDirIndex].y || nextOpenings[0].y == openings[cornerDirIndex].y)) {
											endCell = nextCell;
										}
										
										// If the cell is a corner, there is no more cells to loop over
										inLoop = false;
									}
								} else if (nextOpenings.length === 3) {
									var isValidCrossing = nextOpenings.every((o) => {
										return (o.x === openings[cornerDirIndex].x &&
												o.y === openings[cornerDirIndex].y) ||
												(o.x === openings[loopDirIndex].x && 
												o.y === openings[loopDirIndex].y) ||
												(o.x === -openings[loopDirIndex].x && 
												o.y === -openings[loopDirIndex].y);
									});
									
									if (isValidCrossing){
										offset++
										crossings.push(nextCell);
									} else {
										inLoop = false;
									}
								}
								else {
									inLoop = false;
								}

								if (!inLoop) {
									let isObstructed = false;

									if (endCell) {
										if (cells.length > 0) {
											for (let cell of cells) {
												if (this.virtualGrid[cell.x + openings[cornerDirIndex].x][cell.y + openings[cornerDirIndex].y] == 0) {
													isObstructed = true;
													break;
												}
											}

											if (!isObstructed) {
												isValid = true;
											}
										} else {
											let startInsideCell = {
												x: x + openings[cornerDirIndex].x, 
												y: y + openings[cornerDirIndex].y
											}

											let startInsideWalls = this.CellWalls(startInsideCell, 1);

											isObstructed = !startInsideWalls.some((w) => {
												return w.x === openings[loopDirIndex].x && w.y === openings[loopDirIndex].y;
											});

											if (!isObstructed) {
												isValid = true;
											}
										}
									}
						
									if ((!endCell || isObstructed) && firstAttempt) {
										inLoop = true;
										firstAttempt = false;
										offset = 1;
										cells = [];
										endCell = undefined;
										crossings = [];

										loopDirIndex = 1;
										cornerDirIndex = 0;
									}
								}
							}

							if (!isValid) {
								continue;
							}

							slackLeft = true;
							this.DrawCellFrom(startCell, openings[cornerDirIndex], 1);

							this.UpdateFrame();

							this.DrawCellFrom(endCell, openings[cornerDirIndex], 1);

							this.UpdateFrame();

							this.DrawWallTo(startCell, openings[loopDirIndex], 1)

							this.UpdateFrame();

							for (let cell of cells) {
								this.DrawCellFrom(cell, openings[loopDirIndex], 1);

								this.UpdateFrame();
							}
							for (let cell of crossings) {
								this.DrawWallTo(cell, openings[cornerDirIndex], 1);
								this.UpdateFrame();

								this.DrawCellFrom(cell, openings[loopDirIndex], 1);

								this.UpdateFrame();
							}


							var newStartCell = { x: startCell.x + openings[cornerDirIndex].x, y: startCell.y + openings[cornerDirIndex].y }

							this.DrawWallTo(newStartCell, openings[loopDirIndex], 0);
							this.UpdateFrame();

							for (let cell of cells) {
								var newCell = { x: cell.x + openings[cornerDirIndex].x, y: cell.y + openings[cornerDirIndex].y }

								this.DrawCellFrom(newCell, openings[loopDirIndex], 0);
								this.UpdateFrame();
							}

							for (let cell of crossings) {
								var newCell = { x: cell.x + openings[cornerDirIndex].x, y: cell.y + openings[cornerDirIndex].y }

								this.DrawWallTo(newCell, openings[loopDirIndex], 0);
								this.UpdateFrame();
							}
						}
					}
				}
			}
	 	}
	 }
	 RemoveExcessWall() {
	 	let hasExcess = true;

		while (hasExcess) {
			hasExcess = false;
			for (let x = 0; x < this.virtualGrid.length; x++) {
				for (let y = 0; y < this.virtualGrid[x].length; y++) {
					if (this.virtualGrid[x][y] === 1) {
						var cell = {x: x, y: y};
						var directions = this.GetDirections(cell, 0);;
						if (directions.length >= 3) {
							this.DrawCell(cell, 0);
							this.UpdateFrame();
							hasExcess = true;

							for (let dir of directions) {
				 				if (!this.IsInRoom(x + dir.x, y + dir.y))
				 				{
									this.DrawWallTo(cell, dir, 0);
									this.UpdateFrame();
				 				}
				 			}
						}
					}
				}
			}
		}
	 }
	 RemoveArtifacts() {
	 	for (let x = 0; x < this.grid.length - this.wallWidth; x += this.wallWidth + this.mazeWidth) {
			for (let y = 0; y < this.grid[x].length - this.wallWidth; y += this.wallWidth + this.mazeWidth) {
				if (x - 1 < 0 
					|| y - 1 < 0 
					|| x + this.wallWidth >= this.grid.length 
					|| y + this.wallWidth >= this.grid[x].length) {
					continue;
				}

				if (this.grid[x-1][y] === 0 
					&& this.grid[x][y-1] === 0 
					&& this.grid[x + this.wallWidth][y] === 0 
					&& this.grid[x][y + this.wallWidth] === 0) {
					for (let i = x; i < x + this.wallWidth; i++) {
						for (let j = y; j < y + this.wallWidth; j++) {
							this.grid[i][j] = 0;
						}
					}
				}
			}
			this.UpdateFrame();
		}
	 }
	 RemoveDeadEnds() {
	 	let hasDeadEnds = true;

		while (hasDeadEnds) {
			hasDeadEnds = false;
			for (let x = 0; x < this.virtualGrid.length; x++) {
				for (let y = 0; y < this.virtualGrid[x].length; y++) {
					if (this.virtualGrid[x][y] === 0) {
						var cell = {x: x, y: y};
						var walls = this.CellWalls(cell, 0);
						if (walls.length === 1) {
							this.DrawCellFrom(cell, walls[0], 1);
							this.UpdateFrame();
							hasDeadEnds = true;
						}
					}
				}
			}
		}
	 }
	 RemoveMazeWalls() {
	 	for(let x = 0; x < this.virtualGrid.length; x++) {
	 		for (let y = 0; y < this.virtualGrid.length; y++) {
	 			if (this.virtualGrid[x][y] === 0) {
	 				if (this.IsInRoom(x, y)) {
	 					continue;
	 				}

	 				let cell = { x: x, y: y };

		 			let directions = this.GetDirections(cell, 0);
		 			let walls = this.CellWalls(cell, 1);

		 			let validDirections = directions.filter((d) => {
		 				return walls.some((w) => {
		 					return d.x === w.x && d.y === w.y;
		 				});
		 			});

		 			for (let dir of validDirections) {
		 				if (!this.IsInRoom(x + dir.x, y + dir.y))
		 				{
							this.DrawWallTo(cell, dir, 0);
							this.UpdateFrame();
		 				}
		 			}
	 			}
	 		}
	 	}
	 }
	 IsInRoom(x, y) {
	 	if (!this.rooms) return false;

	 	var isInRoom = false;
		for (let room of this.rooms) {
			if (room.x <= x && room.y <= y && room.xBorder > x && room.yBorder > y) {
				isInRoom = true;
				break;
			}
		}

		return isInRoom;
	 }
	 GetDirections(cell, value) {
	 	let directions = [];

	 	let up = { x: 0, y: -1 };
		let down = { x: 0, y: 1 };
		let left = { x: -1, y: 0 };
		let right = { x: 1, y: 0 };

		if (this.IsDirValid(cell, up) 
			&& this.virtualGrid[cell.x + up.x][cell.y + up.y] === value) 
			directions.push(up);
		if (this.IsDirValid(cell, down) 
			&& this.virtualGrid[cell.x + down.x][cell.y + down.y] === value) 
			directions.push(down);
		if (this.IsDirValid(cell, left) 
			&& this.virtualGrid[cell.x + left.x][cell.y + left.y] === value) 
			directions.push(left);
		if (this.IsDirValid(cell, right) 
			&& this.virtualGrid[cell.x + right.x][cell.y + right.y] === value) 
			directions.push(right);

		return directions;
	 }
	 IsDirValid(cell, dir) {
	 	return cell.x + dir.x >= 0 
	 		&& cell.y + dir.y >= 0
	 		&& cell.x + dir.x < this.width
	 		&& cell.y + dir.y < this.height;
	 }
	 CellWalls(cell, value) {
	 	let x = this.wallWidth + cell.x * (this.wallWidth + this.mazeWidth);
	 	let y = this.wallWidth + cell.y * (this.wallWidth + this.mazeWidth);

	 	let xBorder = x + this.mazeWidth;
	 	let yBorder = y + this.mazeWidth;

	 	let walls = [];

	 	if (this.grid[x][y-1] === value) {
	 		walls.push({x: 0, y: -1});
	 	}
	 	if (this.grid[x - 1][y] === value) {
	 		walls.push({x: -1, y: 0});
	 	}
	 	if (this.grid[x][yBorder] === value) {
	 		walls.push({x: 0, y: 1});
	 	}
	 	if (this.grid[xBorder][y] === value) {
	 		walls.push({x: 1, y: 0});
	 	}

	 	return walls;
	 }
	 DrawRoom(room) {
	 	let x = this.wallWidth + room.x * (this.wallWidth + this.mazeWidth);
	 	let y = this.wallWidth + room.y * (this.wallWidth + this.mazeWidth);

	 	let xBorder = room.xBorder * (this.wallWidth + this.mazeWidth);
	 	let yBorder = room.yBorder * (this.wallWidth + this.mazeWidth);

	 	for (let ix = x; ix < xBorder; ix++) {
			for (let iy = y; iy < yBorder; iy++) {
				this.grid[ix][iy] = 0;
			}
			this.UpdateFrame();
		}

		for (let ix = room.x; ix < room.xBorder; ix++) {
			for (let iy = room.y; iy < room.yBorder; iy++) {
				this.virtualGrid[ix][iy] = 0;
			}
		}
	 }
	 DrawCell(cell, value) {
	 	let x = this.wallWidth + cell.x * (this.wallWidth + this.mazeWidth);
	 	let y = this.wallWidth + cell.y * (this.wallWidth + this.mazeWidth);

	 	let xBorder = x + this.mazeWidth;
	 	let yBorder = y + this.mazeWidth;

	 	for (let ix = x; ix < xBorder; ix++) {
			for (let iy = y; iy < yBorder; iy++) {
				this.grid[ix][iy] = value || 0;
			}
		}

		this.virtualGrid[cell.x][cell.y] = value || 0;
	 }
	 DrawWallTo(cell, dir, value) {
	 	let cellXPosition = this.wallWidth + cell.x * (this.wallWidth + this.mazeWidth);
	 	let cellYPosition = this.wallWidth + cell.y * (this.wallWidth + this.mazeWidth);

 		let gapStartX = cellXPosition + (dir.x === 1 ? this.mazeWidth : dir.x === -1 ? -this.wallWidth : 0);
 		let gapStartY = cellYPosition + (dir.y === 1 ? this.mazeWidth : dir.y === -1 ? -this.wallWidth : 0);

 		for (let x = gapStartX; x < gapStartX + (Math.abs(dir.x) * this.wallWidth) + (Math.abs(dir.y) * this.mazeWidth); x++) {
 			for (let y = gapStartY; y < gapStartY + (Math.abs(dir.y) * this.wallWidth) + (Math.abs(dir.x) * this.mazeWidth); y++) {
 				this.grid[x][y] = value || 0;
 			}
 		}
	 }
	 DrawCellTo(cell, dir, value) {
	 	this.DrawWallTo(cell, dir, value);

	 	this.DrawCell({
	 		x: cell.x + dir.x,
	 		y: cell.y + dir.y
	 	}, value);
	 }
	 DrawCellFrom(cell, dir, value) {
	 	this.DrawWallTo(cell, dir, value);

	 	this.DrawCell(cell, value);
	 }
}