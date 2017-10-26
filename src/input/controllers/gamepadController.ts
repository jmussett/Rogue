import ICode from "../ICode";
import IInput from "../IInput";
import IBinding from "../IBinding";
import IController from "../IController";

let type = "gamepad";

function applyDeadZone(value: number, deadZone: number) {
    if (value >= deadZone) {
        return value;
    } else if (value <= -deadZone) {
        return value;
    }

    return 0;
} 

class GamepadBinding implements IBinding {
    codes: ICode[];
    type: string;
    constructor(codes: ICode[]) {
        this.codes = codes;
        this.type = type;
    }
    BindingAction(input: IInput, deadZone: number) {
        if (input) {
            var values = this.codes.map((code) => {
                if (code.type === "button") {
                    var inputResult = input.buttons[code.value];
                    
                    return applyDeadZone(inputResult.value, deadZone);
                } else {
                    return applyDeadZone(input.axes[code.value], deadZone);
                }
            });

            var bindingDeactivated = values.some((value) => {
                return value === 0;
            });
            
            if (bindingDeactivated) {
                return 0;
            }
            
            var max = Math.max(...values);
            var min = Math.min(...values);
            
            if (max === 1 && min < 0) {
                return min;
            } else if (0 < min) {
                return min;
            } else if (max < 0){
                return max;
            } else {
                return 0;
            }
        } else {
            return 0
        }
    }
}

export let GamepadController: IController = {
    Type: type,
    Init: () => {},
    GetBinding: (...codes: ICode[]) => {
        return new GamepadBinding(codes);
    },
    ScanInputs: (index: number, currentInput?: IInput) => {
        var gamepad = navigator.getGamepads()[index];

        return {
            keys: [],
            buttons: gamepad.buttons,
            axes: gamepad.axes
        }
    }
}