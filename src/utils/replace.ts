import { getReplaceText } from './getReplaceText';

/**
 * replace生成器，方便控制运行状态
 * @param sourceText 需要执行replace的源文本
 * @param matchExp 用于匹配的表达式
 * @param replaceExp 用于替换的表达式
 * @returns
 */
export function* genReplace(
    sourceText: string,
    matchExp: string,
    replaceExp: string
): Generator<string, string, string> {
    const reg = new RegExp(matchExp, 'g');
    let result = sourceText;
    let match: ReturnType<typeof reg.exec>;
    while ((match = reg.exec(result))) {
        yield result;
        let index = match.index;
        let text = match[0];
        let prevStr = sourceText.slice(0, index);
        let nextStr = sourceText.slice(index + text.length);
        let content = getReplaceText(replaceExp, text, ...match.slice(1));
        result = prevStr + content + nextStr;
    }
    return result;
}
