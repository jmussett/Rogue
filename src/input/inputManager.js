export class InputManager {
    constructor() {
        this.actions = {}
        this.controllers = []
        this.inputs = {};
        this.deadZone = 0;
    }
    Action(name) {
        let action = this.actions[name];
        if(!action) {
            return 0
        }
        
        let bindingResults = [];
        
        action.bindings.forEach((binding) => {
            bindingResults.push(binding.BindingAction(this.inputs[binding.Type], this.deadZone));
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
    ScanInputs(index) {
        this.controllers.forEach((controller) => {
            var newInputs = controller.ScanInputs(index, this.inputs[controller.Type]);
            
            if (newInputs) {
                this.inputs[controller.Type] = newInputs;
            }
        });
    }
    RegisterControllers(...controllers) {
        this.controllers = controllers;
        
        this.controllers.forEach((controller) => {
            controller.Init(this);
        });
    }
    RegisterAction(name, ...bindings) {
        this.actions[name] = {
            bindings: bindings
        };
    }
    RegisterDeadZone(deadZone) {
        this.deadZone = deadZone;
    }
}