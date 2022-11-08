import exp = require('constants');
import * as vscode from 'vscode';
import { DefaultSetting, Command } from '../constants';

const DEFAULT_SETTING = {
    match: DefaultSetting.MATCH_KEY,
    prefix: DefaultSetting.PREFIX_KEY,
    actionLanguages: DefaultSetting.ACTION_LANGUAGES,
    actionIgnoreCommands: DefaultSetting.NONE,
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

export function getActionCommands() {
    let actionIgnoreCommands = getSetting().actionIgnoreCommands || [];
    let commands = getCommands()?.filter((i) => !actionIgnoreCommands?.includes(i.name));
    return commands;
}
