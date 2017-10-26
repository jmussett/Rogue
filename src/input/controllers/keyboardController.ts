import ICode from "../ICode";
import IInput from "../IInput";
import IBinding from "../IBinding";
import { InputManager } from "../inputManager";
import IController from "../IController";

const type = "keyboard";

class KeyboardAxesBinding implements IBinding {
    lastNegative: boolean;
    lastPositive: boolean;
    negativePressed: boolean;
    positivePressed: boolean;
    type: string;
    negativeCode: ICode;
    positiveCode: ICode;
    codes: ICode[];

    constructor(negativeCode: ICode, positiveCode: ICode) {
        this.negativeCode = negativeCode;
        this.positiveCode = positiveCode;

        this.lastNegative = false;
        this.lastPositive = false;
        this.negativePressed = false;
        this.positivePressed = false;

        this.type = type;
    }
    BindingAction(input: IInput) {
        if (input) {
            const negativeValue = input.keys[this.negativeCode.value];
            const positiveValue = input.keys[this.positiveCode.value];

            if (negativeValue === 0) {
                this.negativePressed = false;
                this.lastNegative = false;

                if (positiveValue === 1) {
                    this.lastPositive = true;
                    this.positivePressed = true;
                }
            }

            if (positiveValue === 0) {
                this.positivePressed = false;
                this.lastPositive = false;

                if (negativeValue === 1) {
                    this.lastNegative = true;
                    this.negativePressed = true;
                }
            }

            if (negativeValue === 1 && !this.lastNegative && !this.negativePressed) {
                this.lastNegative = true;
                this.lastPositive = false;
                this.negativePressed = true;
            }

            if (positiveValue === 1 && !this.lastPositive && !this.positivePressed) {
                this.lastPositive = true;
                this.lastNegative = false;
                this.positivePressed = true;
            }

            if (this.lastPositive) {
                return 1;
            } else if (this.lastNegative) {
                return -1;
            } else {
                return 0;
            }
        }

        return 0;
    }
}

class KeyboardBinding implements IBinding {
    codes: ICode[];
    type: string;
    constructor(codes: ICode[]) {
        this.codes = codes;
        this.type = type;
    }
    BindingAction(input: IInput) {
        if (input) {
            const values = this.codes.map((code) => {
                return input.keys[code.value];
            });

            const bindingActivated = values.every((value) => {
                return value === 1;
            });

            return bindingActivated ? 1 : 0;
        }

        return 0;
    }
}

export let KeyboardController: IController = {
    Type: type,
    Init: (im: InputManager) => {
        im.inputs[type] = {
            keys: [],
            buttons: [],
            axes: [],
        };

        window.addEventListener("keydown", (e) => {
            im.inputs[type].keys[e.keyCode] = 1;
        });

        window.addEventListener("keyup", (e) => {
            im.inputs[type].keys[e.keyCode] = 0;
        });
    },
    GetBinding: (...codes: ICode[]) => {
        return new KeyboardBinding(codes);
    },
    GetAxesBinding: (negativeCode: ICode, positiveCode: ICode) => {
        return new KeyboardAxesBinding(negativeCode, positiveCode);
    },
    ScanInputs: (index: number, currentInput: IInput) => {
        return currentInput;
    },
};
