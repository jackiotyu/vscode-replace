declare namespace Replace {
    interface Range {
        range: import('vscode').Range;
        group: string[];
        text: string;
    }

    type RangeList = Array<Range>;

    interface replaceRangeWithContent {
        previewRange: import('vscode').Range;
        originRange: import('vscode').Range;
        originContent: string;
        group: string[];
    }
}
