import * as vscode from 'vscode';
import { DefaultSetting, Command } from '../constants';
import localize from '../localize';

const DEFAULT_SETTING = {
    orderOffset: 0,
    order: DefaultSetting.ORDER_KEY,
    match: DefaultSetting.MATCH_KEY,
    prefix: DefaultSetting.PREFIX_KEY,
    actionLanguages: DefaultSetting.ACTION_LANGUAGES,
    actionIgnoreCommands: DefaultSetting.NONE,
    actionFormat: DefaultSetting.ACTION_NAME_FORMAT,
    actionPattern: DefaultSetting.ACTION_PATTERN,
};

const EXAMPLE_COMMAND = {
    name: localize('example.command.name'),
    match: '(\\d+)',
    replace: '+$1 + 1',
    description: localize('example.command.description'),
};

export function getSetting(): ReplaceSetting {
    const setting = vscode.workspace
        .getConfiguration(Command.EXTENSION_NAME)
        .get('setting');
    return setting || DEFAULT_SETTING;
}

export function getCommands() {
    const group = vscode.workspace
        .getConfiguration(Command.EXTENSION_NAME)
        .get('commands') as ReplaceGroup;
    if (!group?.length) {
        return [EXAMPLE_COMMAND];
    }
    return [EXAMPLE_COMMAND, ...group];
}

export function getActionCommands() {
    let actionIgnoreCommands = getSetting().actionIgnoreCommands || [];
    let commands = getCommands()?.filter(
        (i) => !actionIgnoreCommands?.includes(i.name)
    );
    return commands;
}
