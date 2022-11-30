import * as vscode from 'vscode';
import { ReplaceSetting, ReplaceGroup, ReplaceCommand } from '../common';
import { DefaultSetting, Command } from '../constants';
import { uniqueListByKey } from './utils';

const DEFAULT_SETTING = {
    match: DefaultSetting.MATCH_KEY,
    prefix: DefaultSetting.PREFIX_KEY,
    actionLanguages: DefaultSetting.ACTION_LANGUAGES,
    actionIgnoreCommands: DefaultSetting.NONE,
    actionFormat: DefaultSetting.ACTION_NAME_FORMAT,
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
        return;
    }
    return group;
}

export function getActionCommands() {
    let actionIgnoreCommands = getSetting().actionIgnoreCommands || [];
    let commands = getCommands()?.filter(
        (i) => !actionIgnoreCommands?.includes(i.name)
    );
    return commands;
}

/**
 * 保存预设
 * @param rule
 * @param oldRuleName 旧规则名称
 * @returns
 */
export function saveRule({
    rule,
    oldRuleName,
}: {
    rule: ReplaceCommand;
    oldRuleName?: string;
}) {
    const commands = getCommands();
    if (!commands) return;
    // TODO 校验规则是否有效
    let saveCommands = uniqueListByKey([...commands, rule], 'name');
    if (oldRuleName && oldRuleName !== rule.name) {
        let index = saveCommands.findIndex((item) => item.name === oldRuleName);
        ~index && saveCommands.splice(index, 1);
    }
    vscode.workspace
        .getConfiguration(Command.EXTENSION_NAME)
        .update('commands', saveCommands);
}
