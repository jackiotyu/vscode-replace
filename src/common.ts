import { QuickInputButton } from 'vscode';

interface ReplaceCommand {
    name: string;
    match: string;
    replace: string;
    description?: string;
}

interface ReplaceSetting {
    match?: string;
    prefix?: string;
    actionLanguages?: string[];
    actionIgnoreCommands?: string[];
    actionNameFormat?: string;
}

interface PickCommand {
    command: ReplaceCommand;
    button: QuickInputButton;
}

type ReplaceGroup = Array<ReplaceCommand>;

type SelectCommand = ReplaceCommand | PickCommand | undefined;

export {
    ReplaceCommand,
    ReplaceSetting,
    PickCommand,
    ReplaceGroup,
    SelectCommand,
};
