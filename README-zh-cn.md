# js-replace <!-- omit in toc -->

[English doc](./README.md)

匹配文本，对选中文本执行 js 表示式，获取结果后替换内容

![example](images/example.gif)

**目录**

- [功能](#功能)
    - [使用命令](#使用命令)
    - [使用 code action](#使用-code-action)
- [配置](#配置)
    - [replace参数说明](#replace参数说明)
    - [配置示例](#配置示例)
    - [change case 配置](#change-case-配置)

## 功能

- 对当前打开的编辑器内容进行匹配，对选中文本执行 js 表示式，获取结果
- 手动选中文本，对匹配内容执行 js 表示式，获取结果

#### 使用命令

<details>
<summary>示例</summary>

![example](images/example.gif)
</details>

#### 使用 code action

<details>
<summary>示例</summary>

![example2](images/example2.gif)
</details>

## 配置

#### replace参数说明

<details>
<summary>参数说明</summary>

| 参数         | 类型     | 说明                                                                                                                          |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `$1 到 $n`   | `String` | 匹配到的分组内容，从 `$1` 到 `$n` (配置中可修改变量前缀)                                                                      |
| `$_`         | `String` | 匹配到的子串，即正则表达式匹配到的内容（配置中可修改该变量名）                                                                |
| `ChangeCase` | `Object` | 内置的 [change case](https://www.npmjs.com/package/change-case) 变量，包含 change-case 的工具函数，例如 ChangeCase.pascalCase |

</details>

#### 配置示例

<details>
<summary>配置说明</summary>

```json
{
    // 注册replace命令
    "jsReplace.commands": [
        {
            // 指令名称
            "name": "rpx2px",
            // 用于匹配文字的正则表达式
            "match": "([0-9]{1,})rpx",
            // 匹配后的处理，使用js表达式，
            // $1表示匹配到的第一个分组内容，$_表示匹配的子串
            "replace": "`${($1 / 2)}px`",
            // 描述
            "description": "rpx转换px"
        }
    ],
    "jsReplace.setting": {
        // 匹配的子串变量
        "match": "$_",
        // 匹配到分组变量的前缀，设置为$，则变量为$1到$n
        "prefix": "$",
        // 将命令注册到code action中
        "actionLanguages": [
            "javascript",
            "typescript",
            "html",
            "css",
            "less",
            "typescriptreact",
            "scss",
            "python",
            "markdown",
            "json",
            "javascriptreact",
            "sass",
            "go",
            "c"
        ],
        // code action需要忽略的命令，填写jsReplace.commands中定义的"name"字段
        "actionIgnoreCommands": [
            // 例如："define pascalCase"
        ],
        // Code action 命令名称格式化，
        // $name代表命令的name字段，$description代表命令的description字段
        "actionNameFormat": "JSR $name ($description)"
    }
}
```

</details>

#### change case 配置

<details>
<summary>示例</summary>

```json
{
    "jsReplace.commands": [
        {
            "name": "noCase",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.noCase($_)",
            "description": "aa bb"
        },
        {
            "name": "camelCase(大驼峰)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.camelCase($_)",
            "description": "aaBb"
        },
        {
            "name": "pascalCase(小驼峰)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.pascalCase($_)",
            "description": "AaBb"
        },
        {
            "name": "constantCase(常量)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.constantCase($_)",
            "description": "AaBb"
        },
        {
            "name": "snakeCase(下划线)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.snakeCase($_)",
            "description": "aa_bb"
        },
        {
            "name": "pathCase(路径分隔符)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.pathCase($_)",
            "description": "aa/bb"
        },
        {
            "name": "paramCase(横杠分隔)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.paramCase($_)",
            "description": "aa-bb"
        },
        {
            "name": "dotCase(点分隔)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.dotCase($_)",
            "description": "aa.bb"
        },
        {
            "name": "sentenceCase(空格分隔单词)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.sentenceCase($_)",
            "description": "aa bb"
        },
        {
            "name": "capitalCase(首字母大写分隔单词)",
            "match": "\\w{1,}[ _-]?\\w{1,}",
            "replace": "ChangeCase.capitalCase($_)",
            "description": "Aa Bb"
        }
    ]
}
```

</details>
