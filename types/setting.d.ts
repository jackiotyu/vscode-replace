type KeyMap = Record<'offset' | 'originText' | 'match', string>;

interface ReplaceCommand {
    name: string;
    match: string;
    replace: string;
    description?: string;
}

interface ReplaceSetting {
    // 开启更多参数
    // moreParam?: boolean;
    // keyMap?: KeyMap;
    orderOffset?: number;
    order?: string;
    match?: string;
    prefix?: string;
    actionLanguages?: string[];
    actionPattern?: string;
    actionIgnoreCommands?: string[];
    actionNameFormat?: string;
}

type vscode = typeof import('vscode');

declare module vscode {
    type QuickInputButton = import('vscode').QuickInputButton;
}

interface PickCommand {
    command: ReplaceCommand;
    button: vscode.QuickInputButton;
}

type ReplaceGroup = Array<ReplaceCommand>;

type SelectCommand = ReplaceCommand | PickCommand | undefined;
