import ICode from "../ICode";

function button(code: number): ICode {
    return {
        type: "button",
        value: code,
    };
}

function axes(code: number): ICode {
    return {
        type: "axes",
        value: code,
    };
}

export let GamepadCode = {
    Buttons: {
        A: button(0),
        B: button(1),
        X: button(2),
        Y: button(3),
        LB: button(4),
        RB: button(5),
        LT: button(6),
        RT: button(7),
        Back: button(8),
        Start: button(9),
        L3: button(10),
        R3: button(11),
        Up: button(12),
        Down: button(13),
        Left: button(14),
        Right: button(15),
        Home: button(16),
    },
    Axes: {
        LH: axes(0),
        LV: axes(1),
        RH: axes(2),
        RV: axes(3),
    },
};
