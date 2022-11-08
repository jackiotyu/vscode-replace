# vscode-replace

[English doc](./README.md)

## Features

对选中文本执行 js 计算

## 示例

![example](images/example.gif)

## 参数说明

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
        // "匹配到分组变量的前缀，设置为$，则变量为$1到$n
        "prefix": "$"
    }
}
```
