import IController from "./IController";
import IBinding from "./IBinding";
import IInput from "./IInput";

export class InputManager {
    actions: { [key: string]: { bindings: IBinding[] }};
    controllers: IController[];
    inputs: {[key: string]: IInput};
    deadZone: number;

    constructor() {
        this.actions = {}
        this.controllers = []
        this.inputs = {};
        this.deadZone = 0;
    }
    Action(name: string) {
        let action = this.actions[name];
        if(!action) {
            return 0
        }
        
        let bindingResults: number[] = [];
        
        action.bindings.forEach((binding) => {
            bindingResults.push(binding.BindingAction(this.inputs[binding.type], this.deadZone));
        });
        
        var max = Math.max(...bindingResults);
        var min = Math.min(...bindingResults);

        if (min >= 0) {
            return max;
        } else if (max <= 0) {
            return min;
        } else if (-min > max){
            return min;
        }

        return max;
    }
    ScanInputs(index: number) {
        this.controllers.forEach((controller) => {
            var newInputs = controller.ScanInputs(index, this.inputs[controller.Type]);
            
            if (newInputs) {
                this.inputs[controller.Type] = newInputs;
            }
        });
    }
    RegisterControllers(...controllers: IController[]) {
        this.controllers = controllers;
        
        this.controllers.forEach((controller) => {
            controller.Init(this);
        });
    }
    RegisterAction(name: string, ...bindings: IBinding[]) {
        this.actions[name] = {
            bindings: bindings
        };
    }
    RegisterDeadZone(deadZone: number) {
        this.deadZone = deadZone;
    }
}