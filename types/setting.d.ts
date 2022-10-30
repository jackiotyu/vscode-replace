type KeyMap = Record<'result' | 'offset' | 'originText' | 'match', string>;

interface ReplaceCommand {
    name: string;
    match: string;
    replace: string;
    description?: string;
}

interface ReplaceSetting {
    // 开启更多参数
    moreParam?: boolean;
    keyMap?: KeyMap;
}

type ReplaceGroup = Array<ReplaceCommand>;
