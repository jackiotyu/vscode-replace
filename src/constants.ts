export enum Command {
    EXTENSION_NAME = 'jsReplace',
    REPLACE_EVENT = 'jsReplace.replace',
    SELECT_OPTION_EVENT = 'jsReplace.selectOption',
    WEBVIEW_ID = 'jsReplace.webview',
}

export enum DefaultSetting {
    // 匹配到的子字符串在原字符串中的偏移量。（比如，如果原字符串是 'abcd'，匹配到的子字符串是 'bc'，那么这个参数将会是 1）
    // OFFSET_KEY = '__offset__',
    // 被匹配的原字符串
    // ORIGIN_TEXT_KEY = '__origin_text__',
    // 匹配的子串
    MATCH_KEY = '$_',
    PREFIX_KEY = '$',
    ACTION_LANGUAGE = '',
}
