let type = "gamepad";

function applyDeadZone(value, deadZone) {
    if (value >= deadZone) {
        return value;
    } else if (value <= -deadZone) {
        return value;
    }

    return 0;
} 

class GamepadBinding {
    constructor(codes) {
        this.codes = codes;
        this.Type = type;
    }
    BindingAction(input, deadZone) {
        if (input) {
            
            var values = this.codes.map((code) => {
                if (code.type === "button") {
                    var inputResult = input.buttons[code.value];
                    
                    if (typeof(inputResult) === "object") {
                        return applyDeadZone(inputResult.value, deadZone);
                    } else {
                        return applyDeadZone(inputResult, deadZone);
                    }
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

export let GamepadController = {
    Type: type,
    Init: () => {},
    GetBinding: (...codes) => {
        return new GamepadBinding(codes);
    },
    ScanInputs: (index) => {
        return navigator.getGamepads()[index];
    }
}