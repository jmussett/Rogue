import ICode from "./ICode";

export default interface IInput {
    keys: {[key: number]: number};
    buttons: {[key: number]: GamepadButton};
    axes: {[key: number]: number};
}
