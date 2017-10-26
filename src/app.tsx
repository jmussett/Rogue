import * as PIXI from 'pixi.js'
import * as React from "react"
import {InputManager} from './input/inputManager'
import {GamepadController} from './input/controllers/gamepadController'
import {KeyboardController} from './input/controllers/keyboardController'
import {GamepadCode} from './input/codes/gamepadCode'
import {KeyCode} from './input/codes/keyCode'
import {World} from './world'
import {Camera} from './camera'
import {FrameManager} from './frameManager'

interface IAppProps {
	animate?: boolean,
	animationDelay?: number,
	showPlayer?: boolean,
	showFOV?: boolean,
	tileSize?: number,
	seed?: string
}

export default class App extends React.Component<IAppProps>{
	renderer: PIXI.WebGLRenderer;
	world: World;
	camera: Camera;
	IM: InputManager;
	refs: {
		canvas: HTMLCanvasElement
	}
	constructor(props: IAppProps) {
		super(props);
	}
	componentDidMount() {
		this.renderer = new PIXI.WebGLRenderer({
			antialias: true,
			backgroundColor: 0xFFFFFF,
			view: this.refs.canvas,
			clearBeforeRender: true
		});

		this.world = new World({
			animate: this.props.animate == undefined ? true : this.props.animate,
			animationDelay: this.props.animationDelay || 7,
			showPlayer: this.props.showPlayer || false,
			showFOV: this.props.showFOV || false,
			tileSize: this.props.tileSize || 30,
			seed: this.props.seed,
			width: 50,
			height: 50,
			xPosition: 75,
			yPosition: 75
		});

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

		let frameManager = new FrameManager({
			update: this.update.bind(this),
			render: this.renderer.render.bind(this.renderer, this.camera)
		});

		frameManager.Start();
	}
	update() {
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
	render () {
		return <canvas ref="canvas"></canvas>;
	}
}