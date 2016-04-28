import PIXI from 'pixi.js'

function scaleView(camera) {
    camera.view.width = camera.viewport.width / camera.zoom;
    camera.view.height = camera.viewport.height / camera.zoom;
}

function constrainView(camera) {

    if (!camera.bounded) {
        return;
    }

    let xBound = camera.bounds.x;
    let yBound = camera.bounds.y;
    let viewWidth = camera.view.width;
    let viewHeight = camera.view.height
    let boundsWidth = camera.bounds.width;
    let boundsHeight = camera.bounds.height;

    if (camera.view.x < xBound) {
        camera.view.x = xBound;
    }

    if (camera.view.y < yBound) {
        camera.view.y = yBound;
    }

    if (camera.view.x + viewWidth > xBound + boundsWidthh) {
        camera.view.x = xBound + boundsWidth - viewWidth;
    }

    if (camera.view.y + viewHeight> yBound + boundsHeight) {
        camera.view.y = yBound + boundsHeight - viewHeight;
    }
};

export class Camera extends PIXI.Container {
	constructor(content) {
		super();

		this.content = content;

	    this.root = content;

	    this.target = new PIXI.Container();

	    this.viewport = new PIXI.Rectangle(0, 0, 300, 300);
	    this.view = this.viewport.clone();

	    this.addChild(this.root)

	    this.bounded = false;
	    this.zoom = 1;
	    this.previousZoom = 1;

	}
	Update() {
		let viewX = this.view.x * this.zoom;
		let viewY = this.view.y * this.zoom;
		let exactTargetX = (this.target.position.x + (this.target.width / 2)) * this.zoom;
		let exactTargetY = (this.target.position.y + (this.target.height / 2)) * this.zoom;
		let relativeTargetX = exactTargetX - (this.view.x * this.zoom);
		let relativeTargetY = exactTargetY - (this.view.y * this.zoom);

		if (this.circularDeadzone) {
			if (!this.circularDeadzone.contains(relativeTargetX, relativeTargetY)) {
				var xDistance = exactTargetX - viewX - this.circularDeadzone.x;
				var yDistance = exactTargetY - viewY - this.circularDeadzone.y;

				var angle = Math.atan2(xDistance, yDistance);

				var newTargetX = Math.sin(angle) * this.circularDeadzone.radius;
				var newTargetY = Math.cos(angle) * this.circularDeadzone.radius;

				viewX = exactTargetX - newTargetX - this.circularDeadzone.x;
				viewY = exactTargetY - newTargetY - this.circularDeadzone.y;
			}
		}

		if (this.deadzone) {
			if (relativeTargetX < this.deadzone.x) {
				viewX = exactTargetX - this.deadzone.x;
			} else if (relativeTargetX > this.deadzone.x + this.deadzone.width) {
				viewX = exactTargetX - (this.deadzone.x + this.deadzone.width);
			}

			if (relativeTargetY < this.deadzone.y) {
				viewY = exactTargetY - this.deadzone.y;
			} else if (relativeTargetY > this.deadzone.y + this.deadzone.height) {
				viewY = exactTargetY - (this.deadzone.y + this.deadzone.height);
			}
		}

		if (this.follow) {
			var xDistance = viewX + (this.width / 2) - exactTargetX;
			var yDistance = viewY + (this.height / 2) - exactTargetY;

			var distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

			var angle = Math.atan2(xDistance, yDistance);

			var xVelocity = (Math.sin(angle) * distance) / (10 * this.followFriction);
			var yVelocity = (Math.cos(angle) * distance) / (10 * this.followFriction);

			viewX -= xVelocity;
			viewY -= yVelocity;
		}

		if ((!this.follow && !this.deadzone && !this.circularDeadzone) || this.zoom != this.previousZoom) {
			this.previousZoom = this.zoom;
			viewX = exactTargetX - (this.width / 2);
	    	viewY = exactTargetY - (this.height / 2);
		}
	
	    this.view.x = viewX / this._zoom;
	    this.view.y = viewY / this._zoom;

	    constrainView(this);

	    this.root.position.set(
	        -this.view.x * this._zoom,
	        -this.view.y * this._zoom
	    );
	}
	DeadZone(...args) {
		this.deadzone = new PIXI.Rectangle(...args);

		this.thing = new PIXI.Graphics();
		this.addChild(this.thing);

	    this.thing.clear();
	    this.thing.lineStyle(10, 0xff0000, 1);
    	this.thing.beginFill(0xffFF00, 0.5);
    	this.thing.drawRect(this.deadzone.x, this.deadzone.y, this.deadzone.width, this.deadzone.height);
    	this.thing.endFill();
	}
	CircularDeadZone(...args) {
		this.circularDeadzone = new PIXI.Circle(...args);

		this.thing = new PIXI.Graphics();
		this.addChild(this.thing);

	    this.thing.clear();
	    this.thing.lineStyle(10, 0xff0000, 1);
    	this.thing.beginFill(0xffFF00, 0.5);
    	this.thing.drawCircle(...args);
    	this.thing.endFill();
	}
	Follow(followFriction) {
		this.follow = true;
		this.followFriction = followFriction;
	}
	get width() {
		return this.viewport.width;
	}
	set width(value) {
		this.viewport.width = value;
        scaleView(this);
        constrainView(this);

        return this.viewport.width;
	}
	get height() {
		return this.viewport.height;
	}
	set height(value) {
		this.viewport.height = value;
        scaleView(this);
        constrainView(this);

        return this.viewport.height;
	}
	get zoom() {
		return this._zoom;
	}
	set zoom(value) {
		this._zoom = value;
        this.root.scale.set(value);
        scaleView(this);
        constrainView(this);

        return this._zoom;
	}
}