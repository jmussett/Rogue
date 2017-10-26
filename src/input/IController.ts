import { InputManager } from "./inputManager";
import IBinding from "./IBinding";
import ICode from "./ICode";
import IInput from "./IInput";

export default interface IController {
    Type: string;
    Init?: (im: InputManager) => void;
    GetBinding: (...codes: ICode[]) => IBinding;
    GetAxesBinding?: (negativeCode: ICode, positiveCode: ICode) => IBinding;
    ScanInputs: (index: number, currentInput?: IInput) => IInput;
}
