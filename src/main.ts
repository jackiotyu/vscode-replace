import * as vscode from 'vscode';
import * as vm from 'vm';

type KeyMap = Record<'result' | 'offset' | 'originText' | 'match', string>;

interface ReplaceCommand {
    name: string;
    match: RegExp;
    replace: string;
    description?: string;
}

interface ReplaceSetting {
    // 开启更多参数
    moreParam?: boolean;
    keyMap?: KeyMap;
}

type ReplaceGroup = Array<ReplaceCommand>;

// 默认内部使用的键名
const DEFAULT_RESULT_KEY = '__inner_res__';
// 匹配到的子字符串在原字符串中的偏移量。（比如，如果原字符串是 'abcd'，匹配到的子字符串是 'bc'，那么这个参数将会是 1）
const DEFAULT_OFFSET_KEY = '__offset__';
// 被匹配的原字符串
const DEFAULT_ORIGIN_TEXT_KEY = '__origin_text__';
// 匹配的子串
const DEFAULT_MATCH_KEY = '$&';

const DEFAULT_SETTING = {
    moreParam: false,
    keyMap: {
        result: DEFAULT_RESULT_KEY,
        offset: DEFAULT_OFFSET_KEY,
        originText: DEFAULT_ORIGIN_TEXT_KEY,
        match: DEFAULT_MATCH_KEY,
    },
};

// 获取需要执行的命令
async function getCommand() {
    const group = vscode.workspace.getConfiguration('vscode-replace').get('commands') as ReplaceGroup;
    if (!group?.length) {
        return;
    }

    let items: vscode.QuickPickItem[] = group.map((item) => ({ label: item.name, description: item.description }));
    let selection = (await vscode.window.showQuickPick(items)) as vscode.QuickPickItem;
    if (!selection) return;

    let command = group.find((i) => i.name === selection.label) as ReplaceCommand;
    return command;
}

function getSetting(): ReplaceSetting {
    const setting = vscode.workspace.getConfiguration('vscode-replace').get('setting');
    return setting || DEFAULT_SETTING;
}

/**
 * 获取替换后的内容
 * @param command 设置的替换配置
 * @param text 匹配的文本
 * @param args
 * @returns
 */
function getReplacement(command: ReplaceCommand, text: string, ...args: any[]) {
    try {
        const { replace } = command;
        const { moreParam, keyMap } = getSetting();

        let argGroup = args.slice(0, -2);
        let offset = args[args.length - 2];
        let originText = args[args.length - 1];
        let resultKey = keyMap?.result || DEFAULT_RESULT_KEY;
        let paramMap: Record<string, string> = argGroup.reduce((map, item, index) => {
            map[`$${index + 1}`] = item;
            return map;
        }, {});
        paramMap[resultKey] = text;

        // 开启更多参数
        if (moreParam) {
            paramMap[keyMap?.match || DEFAULT_MATCH_KEY] = text;
            paramMap[keyMap?.offset || DEFAULT_OFFSET_KEY] = offset;
            paramMap[keyMap?.originText || DEFAULT_ORIGIN_TEXT_KEY] = originText;
        }
        // TODO 判断是否为js表达式

        // 使用vm模块运行replace内容，获取运行结果
        let context = vm.createContext(paramMap);
        vm.runInContext(`${resultKey}=` + replace, context);
        return context[resultKey];
    } catch (error) {
        return text;
    }
}

/**
 * 替换编辑器文本
 * @param activeEditor 当前激活的编辑器
 * @param text 需要替换的文本
 */
function handleReplace(activeEditor: vscode.TextEditor, text: string) {
    var firstLine = activeEditor.document.lineAt(0);
    var lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
    var textRange = new vscode.Range(
        0,
        firstLine.range.start.character,
        activeEditor.document.lineCount - 1,
        lastLine.range.end.character,
    );

    activeEditor.edit((builder) => {
        builder.replace(textRange, text);
    });
}

async function transform(activeEditor: vscode.TextEditor) {
    let command = (await getCommand()) as ReplaceCommand;
    if (!command) return;
    let doc = activeEditor.document.getText();
    // TODO 内容匹配设定
    // TODO 匹配内容高亮
    let result = doc.replace(new RegExp(command.match, 'g'), (text, ...args) => {
        return getReplacement(command, text, ...args);
    });

    // TODO 确认替换
    let pickOptions = ['确认', '取消'];

    let confirm = await vscode.window.showInformationMessage('确认替换？', ...pickOptions);

    console.log(confirm, 'confirm');
    if (confirm === pickOptions[0]) {
        handleReplace(activeEditor, result);
    }
}

export { transform };
