import * as vscode from 'vscode';
import { ReplaceCommand } from './common';

export enum Command {
    EXTENSION_NAME = 'jsReplace',
    REPLACE_EVENT = 'jsReplace.replace',
    SELECT_OPTION_EVENT = 'jsReplace.selectOption',
    WEBVIEW_ID = 'jsReplace.webview',
}

export const DefaultSetting = {
    // 匹配的子串
    MATCH_KEY: '$_',
    PREFIX_KEY: '$',
    NONE: null,
    ACTION_LANGUAGES: [
        'javascript',
        'typescript',
        'html',
        'css',
        'less',
        'typescriptreact',
        'scss',
        'python',
        'markdown',
        'json',
        'javascriptreact',
        'sass',
        'go',
        'c',
    ],
    ACTION_NAME_FORMAT: 'JSR $name ($description)',
};

/** 搜索到的结果 */
export interface MatchResult {
    /** 文件数 */
    file: number;
    /** 可替换的计数 */
    count: number;
    list: vscode.Uri[];
}

// webview与插件进程的事件type，统一管理
export enum MsgType {
    /** 重载页面 */
    RELOAD = 'reload',
    // 注册的命令
    COMMANDS = 'commands',
    /** 匹配 */
    MATCH = 'match',
    /** 替换 */
    REPLACE = 'replace',
    /** 包含文件 */
    INCLUDE = 'include',
    /** 排除文件 */
    EXCLUDE = 'exclude',
    /** 匹配结果 */
    MATCH_RESULT = 'matchResult',
}

// webview进程的type
export type MsgKey = `${MsgType}`;

export type MessageKey = MsgKey;

// 生成插件进程的payload
export type GenExtPayload<T extends MsgKey, K> = {
    id: string;
    type: T;
    value?: K;
};

// 生成webview进程的payload
export type GenWebviewPayload<T extends MsgKey, K> = {
    id: string;
    type: T;
    value?: K;
};

// 插件进程发送给webview的数据格式
export type ExtCommandsPayload = GenExtPayload<
    MsgType.COMMANDS,
    ReplaceCommand[]
>;
export type ExtDefaultPayload = GenExtPayload<MessageKey, 'ok' | 'error'>;
export type ExtMatchResultPayload = GenExtPayload<
    MsgType.MATCH_RESULT,
    MatchResult
>;

// webview发送给插件进程的数据格式
export type WebviewReloadMsg = GenWebviewPayload<MsgType.RELOAD, undefined>;
export type WebviewCommandsMsg = GenWebviewPayload<MsgType.COMMANDS, undefined>;
export type WebviewMatchMsg = GenWebviewPayload<MsgType.MATCH, string>;
export type WebviewReplaceMsg = GenWebviewPayload<MsgType.REPLACE, string>;
export type WebviewIncludeMsg = GenWebviewPayload<MsgType.INCLUDE, string>;
export type WebviewExcludeMsg = GenWebviewPayload<MsgType.EXCLUDE, string>;

// webview发送给插件进程的数据格式
export type WebviewPayloadType =
    | WebviewReloadMsg
    | WebviewCommandsMsg
    | WebviewMatchMsg
    | WebviewReplaceMsg
    | WebviewIncludeMsg
    | WebviewExcludeMsg;

// 插件进程发送给webview的数据格式
export type ExtPayloadType =
    | ExtCommandsPayload
    | ExtDefaultPayload
    | ExtMatchResultPayload;
