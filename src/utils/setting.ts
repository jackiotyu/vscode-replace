import * as vscode from 'vscode';
import { DefaultSetting, Command } from '../constants';

const DEFAULT_SETTING = {
    moreParam: false,
    keyMap: {
        offset: DefaultSetting.OFFSET_KEY,
        originText: DefaultSetting.ORIGIN_TEXT_KEY,
        match: DefaultSetting.MATCH_KEY,
    },
};

export function getSetting(): ReplaceSetting {
    const setting = vscode.workspace.getConfiguration(Command.EXTENSION_NAME).get('setting');
    return setting || DEFAULT_SETTING;
}

export function getCommands() {
    const group = vscode.workspace.getConfiguration(Command.EXTENSION_NAME).get('commands') as ReplaceGroup;
    if (!group?.length) {
        return;
    }
    return group;
}
