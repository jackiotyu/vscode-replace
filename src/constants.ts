export enum Command {
    EXTENSION_NAME = 'jsReplace',
    REPLACE_EVENT = 'jsReplace.replace',
    SELECT_OPTION_EVENT = 'jsReplace.selectOption',
    WEBVIEW_ID = 'jsReplace.webview',
}

export const DefaultSetting = {
    // 匹配到的子字符串在原字符串中的偏移量。（比如，如果原字符串是 'abcd'，匹配到的子字符串是 'bc'，那么这个参数将会是 1）
    // OFFSET_KEY = '__offset__',
    // 被匹配的原字符串
    // ORIGIN_TEXT_KEY = '__origin_text__',
    // 匹配的子串
    MATCH_KEY: '$_',
    PREFIX_KEY: '$',
    ORDER_OFFSET: 0,
    ORDER_KEY: '$order',
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
    ACTION_PATTERN: '**',
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
