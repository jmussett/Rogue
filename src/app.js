import PIXI from 'pixi.js'
import {InputManager} from 'input/inputManager'
import {GamepadController} from 'input/controllers/gamepadController'
import {KeyboardController} from 'input/controllers/keyboardController'
import {GamepadCode} from 'input/codes/gamepadCode'
import {KeyCode} from 'input/codes/keyCode'
import {World} from 'world'
import {Camera} from 'camera'
import {FrameManager} from 'frameManager'

export class App {
	constructor() {
		PIXI.utils._saidHello = true;

		this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
		    antialias: true
		});
		this.renderer.backgroundColor = 0xFFFFFF;

		this.world = new World(50);
		this.camera = new Camera(this.world);
		this.camera.width = this.renderer.width;
		this.camera.height = this.renderer.height;
		this.camera.target = this.world.player;
		this.camera.Follow(2);
		this.camera.zoom = 0.1;

		let GC = GamepadController;
		let KC = KeyboardController;

		this.IM = new InputManager();

		this.IM.RegisterControllers(GC, KC);
		this.IM.RegisterDeadZone(0.2);
		this.IM.RegisterAction('ActionA', GC.GetBinding(GamepadCode.Buttons.A), KC.GetBinding(KeyCode.P));
		this.IM.RegisterAction('ActionB', GC.GetBinding(GamepadCode.Buttons.B), KC.GetBinding(KeyCode.O));
		this.IM.RegisterAction('ActionC', GC.GetBinding(GamepadCode.Buttons.X), KC.GetBinding(KeyCode.X));
		this.IM.RegisterAction('ActionD', GC.GetBinding(GamepadCode.Buttons.Y), KC.GetBinding(KeyCode.Z));
		this.IM.RegisterAction('Vertical', GC.GetBinding(GamepadCode.Axes.LV), KC.GetAxesBinding(KeyCode.W, KeyCode.S));
		this.IM.RegisterAction('Horizontal', GC.GetBinding(GamepadCode.Axes.LH), KC.GetAxesBinding(KeyCode.A, KeyCode.D));
		this.IM.RegisterAction('ActionAB', GC.GetBinding(GamepadCode.Axes.RV, GamepadCode.Axes.LV), KC.GetBinding(KeyCode.X, KeyCode.Z));

		this.frameManager = new FrameManager({
			update: this.Update.bind(this),
			render: this.renderer.render.bind(this.renderer, this.camera)
		});

		this.frameManager.Start();
	}
	attached() {
		this.content.appendChild(this.renderer.view);
	}
	Update() {
		//this.IM.ScanInputs(0);

	    // if (this.IM.Action('ActionA') === 1) {
	    //     this.camera.zoom += 0.005;
	    // } else if (this.IM.Action('ActionB') === 1) {
	    //     this.camera.zoom -= 0.005;
	    // }

	    // if (this.IM.Action('ActionC') === 1) {
	    //     this.world.range += 1
	    // } else if (this.IM.Action('ActionD') === 1) {
	    //     this.world.range -= 1

	    // }

	    this.world.Update(this.IM);
	    this.camera.Update();
	}
}