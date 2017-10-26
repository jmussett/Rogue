import IInput from "./IInput";
import ICode from "./ICode";

export default interface IBinding {
    codes: ICode[];
    type: string;
    BindingAction: (input: IInput, deadZone: number) => number;
}
