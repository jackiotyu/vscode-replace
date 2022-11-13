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

// 插件进程传递给webview的事件type
export enum ExtMsgType {
    // 注册的命令
    COMMANDS = 'commands',
}

// webview传递给插件进程的事件type
export enum WebviewMsgType {
    RELOAD = 'reload',
    // 注册的命令
    COMMANDS = 'commands',
}

// 插件进程的type
export type ExtMsgKey = `${ExtMsgType}`;

// webview进程的type
export type WebviewMsgKey = `${WebviewMsgType}`;

export type MessageKey = ExtMsgKey | WebviewMsgKey;

// 生成插件进程的payload
export type GenExtPayload<T extends ExtMsgKey, K> = {
    id: string;
    type: T;
    value?: K;
};

// 生成webview进程的payload
export type GenWebviewPayload<T extends WebviewMsgKey, K> = {
    id: string;
    type: T;
    value?: K;
};

// 插件进程发送给webview的数据格式
export type ExtCommandsPayload = GenExtPayload<
    ExtMsgType.COMMANDS,
    ReplaceCommand[]
>;

// webview发送给插件进程的数据格式
export type WebviewReloadMsg = GenWebviewPayload<
    WebviewMsgType.RELOAD,
    undefined
>;
export type WebviewCommandsMsg = GenWebviewPayload<
    WebviewMsgType.COMMANDS,
    undefined
>;

// webview发送给插件进程的数据格式
export type WebviewPayloadType = WebviewReloadMsg | WebviewCommandsMsg;

// 插件进程发送给webview的数据格式
export type ExtPayloadType = ExtCommandsPayload;
