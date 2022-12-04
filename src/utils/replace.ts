import { getReplaceText } from './getReplaceText';

/**
 * replace生成器，方便控制运行状态
 * @param sourceText 需要执行replace的源文本
 * @param matchExp 用于匹配的表达式
 * @param replaceExp 用于替换的表达式
 * @param includesIndexList 需要替换的索引位置
 * @returns
 */
export function* genReplace(
    sourceText: string,
    matchExp: string,
    replaceExp: string,
    includesIndexList: number[]
): Generator<string, string, string> {
    const reg = new RegExp(matchExp, 'g');
    let result = sourceText;
    let match: ReturnType<typeof reg.exec>;
    let offset = 0;
    while ((match = reg.exec(sourceText))) {
        yield result;
        let index = match.index;
        if (!includesIndexList.includes(index)) continue;
        let text = match[0];
        let prevStr = result.slice(0, index + offset);
        let nextStr = result.slice(index + offset + text.length);
        let content = getReplaceText(replaceExp, text, ...match.slice(1));
        offset += content.length - text.length;
        result = prevStr + content + nextStr;
    }
    return result;
}
