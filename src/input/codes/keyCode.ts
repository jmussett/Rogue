import ICode from "../ICode";

function key(code: number): ICode {
    return {
        type: "key",
        value: code,
    };
}

export let KeyCode = {
    BackSpace: key(8),
    Tab: key(9),
    Enter: key(13),
    Shift: key(16),
    Ctrl: key(17),
    Alt: key(18),
    Pause: key(19),
    CapsLock: key(20),
    Escape: key(27),
    PageUp: key(33),
    PageDown: key(34),
    End: key(35),
    Home: key(36),
    LeftArrow: key(37),
    UpArrow: key(38),
    RightArrow: key(39),
    DownArrow: key(40),
    Insert: key(45),
    Delete: key(46),
    Zero: key(48),
    One: key(49),
    Two: key(50),
    Three: key(51),
    Four: key(52),
    Five: key(53),
    Six: key(54),
    Seven: key(55),
    Eight: key(56),
    Nine: key(57),
    A: key(65),
    B: key(66),
    C: key(67),
    D: key(68),
    E: key(69),
    F: key(70),
    G: key(71),
    H: key(72),
    I: key(73),
    J: key(74),
    K: key(75),
    L: key(76),
    M: key(77),
    N: key(78),
    O: key(79),
    P: key(80),
    Q: key(81),
    R: key(82),
    S: key(83),
    T: key(84),
    U: key(85),
    V: key(86),
    W: key(87),
    X: key(88),
    Y: key(89),
    Z: key(90),
    LeftWindowKey: key(91),
    RightWindowKey: key(92),
    SelectKey: key(93),
    Numpad0: key(96),
    Numpad1: key(97),
    Numpad2: key(98),
    Numpad3: key(99),
    Numpad4: key(100),
    Numpad5: key(101),
    Numpad6: key(102),
    Numpad7: key(103),
    Numpad8: key(104),
    Numpad9: key(105),
    Multiply: key(106),
    Add: key(107),
    Subtract: key(109),
    DecimalPoint: key(110),
    Devide: key(111),
    F1: key(112),
    F2: key(113),
    F3: key(114),
    F4: key(115),
    F5: key(116),
    F6: key(117),
    F7: key(118),
    F8: key(119),
    F9: key(120),
    F10: key(121),
    F11: key(122),
    F12: key(123),
    NumLock: key(144),
    ScrollLock: key(145),
    SemiColon: key(186),
    EqualSign: key(187),
    Comma: key(188),
    Dash: key(189),
    Period: key(190),
    ForwardSlash: key(191),
    GraveAccent: key(192),
    OpenBracket: key(219),
    BackSlash: key(220),
    CloseBracket: key(221),
    SingleQuote: key(222),
};
