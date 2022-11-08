# js-replace

[中文文档](./README-zh-cn.md)

## Features

match text and transform with JavaScript expression

## Example

#### 1. use command

![example](images/example.gif)

#### 2. use code action

![example2](images/example2.gif)

## Parameter description

```json
{
    // Register the replace command
    "jsReplace.commands": [
        {
            // Replace command
            "name": "rpx2px",
            // A regular expression used to match literals
            "match": "([0-9]{1,})rpx",
            // Processing after matching, using js expressions,
            // $1 represents the first grouping content matched, and $_ represents the matched substring
            "replace": "`${($1 / 2)}px`",
            // Describes the command content
            "description": "rpx转换px"
        }
    ],
    // Replace settings, configure variable name mappings for more parameters and $1 to $n prefix customization
    "jsReplace.setting": {
        // Matching substrings
        "match": "$_",
        // If the prefix matches the grouping variable, set to $, the variable is $1 to $n
        "prefix": "$",
        // Register the command with the code action
        "actionLanguages": [
            // "javascript", "typescript", and more ...
        ]
    }
}
```
