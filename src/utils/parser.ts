/**
 * 获取替换后的内容
 * @param command 设置的替换配置
 * @param text 匹配的文本
 * @param args
 * @returns
 */
//  export function parseReplace(command: ReplaceCommand, text: string, ...args: string[]) {
//     const { replace } = command;

//     if (replace === '' || replace === undefined) {
//         throw new Error(localize('transform.action.replace.confirm'));
//     }

//     const { prefix, match } = getSetting();

//     let prefixKey = prefix || DefaultSetting.PREFIX_KEY;
//     let paramMap: Record<string, any> = {
//         [match || DefaultSetting.MATCH_KEY]: text,
//     };

//     args.forEach((item, index) => {
//         paramMap[`${prefixKey}${index + 1}`] = item;
//     });

//     paramMap.ChangeCase = ChangeCase;

//     // 使用vm模块运行replace内容，获取运行结果
//     let context = vm.createContext(paramMap);
//     let result = vm.runInContext(replace || '""', context, { timeout: 6000, displayErrors: true });
//     // 类型保护，引用类型和undefined不返回
//     let resultType = typeof result;
//     if (['object', 'function', 'undefined'].includes(resultType) && result !== null) {
//         throw new SyntaxError(localize('replace.error.notString'));
//     }
//     return String(result);
// }
