let type = "keyboard";

class KeyboardAxesBinding {
    constructor(negativeCode, positiveCode) {
        this.negativeCode = negativeCode;
        this.positiveCode = positiveCode;

        this.lastNegative = false;
        this.lastPositive = false;
        this.negativePressed = false;
        this.positivePressed = false;

        this.Type = type;
    }
    BindingAction(input) {
        if (input) {
            var negativeValue = input.keys[this.negativeCode];
            var positiveValue = input.keys[this.positiveCode];

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

class KeyboardBinding {
    constructor(codes) {
        this.codes = codes;
        this.Type = type;
    }
    BindingAction(input) {
        if (input) {
            var values = this.codes.map((code) => {
                return input.keys[code];
            });
            
            var bindingActivated = values.every((value) => {
                return value === 1;
            });
            
            return bindingActivated ? 1 : 0;
        }
        
        return 0;
    }
}

export let KeyboardController = {
    Type: type,
    Init: (im) => {
        im.inputs[type] = {
            keys: []
        };
        
        window.addEventListener("keydown", (e) => {
            im.inputs[type].keys[e.keyCode] = 1;
        });

        window.addEventListener('keyup', (e) => {
            im.inputs[type].keys[e.keyCode] = 0;
        });
    },
    GetBinding: (...codes) => {
        return new KeyboardBinding(codes);
    },
    GetAxesBinding: (negativeCode, positiveCode) => {
        return new KeyboardAxesBinding(negativeCode, positiveCode);
    },
    ScanInputs: (index, currentInput) => {
        return currentInput;
    }
}