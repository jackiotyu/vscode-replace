<template>
    <div class="mainBox">
        <h1 ref="ref1">{{ msg }}</h1>
        <vscode-dropdown class="selectBox topButMargin">
            <vscode-option value=""></vscode-option>
            <vscode-option value="1">预设1</vscode-option>
            <vscode-option value="2">预设2</vscode-option>
            <vscode-option value="3">预设3</vscode-option>
            <vscode-option value="4">预设4</vscode-option>
        </vscode-dropdown>
        <div class="flexBox topButMargin">
            <input type="text" placeholder="匹配" class="matching" />
            <vscode-button>匹配</vscode-button>
        </div>
        <div class="flexBox topButMargin">
            <input type="text" placeholder="替换" />
        </div>
        <div class="buttonBox topButMargin">
            <vscode-button class="btnLeftMargin">保存预设</vscode-button>
            <vscode-button class="btnLeftMargin">替换</vscode-button>
        </div>
        <div class="flexBox topButMargin">
            <vscode-checkbox>
                <span class="textActive">12 </span>文件匹配到<span
                    class="textActive"
                    >1234 </span
                >个结果
            </vscode-checkbox>
        </div>
        <div class="resultList"></div>
    </div>
</template>

<script lang="ts">
// import { getBaseUri } from '@/utils/common';
import { ref } from 'vue';
// import { vscode } from '@/utils/common';
// const baseUri = getBaseUri();
export default {
    name: 'HomeView',
    setup() {
        let msg = ref('JS Replayce');
        return {
            msg,
        };
    },
    components: {},
};
</script>
<style lang="scss">
.topButMargin {
    margin: 6px 0px;
}

.btnLeftMargin {
    margin-left: 6px;
}

.mainBox {
    width: 100%;
    height: 100%;
    max-width: 600px;
    min-width: 200px;
    margin: 0px auto;
    position: relative;

    .selectBox {
        width: 100%;
    }

    .flexBox {
        display: flex;
        justify-content: space-between;
    }

    .matching {
        flex: 1;
        margin-right: 6px;
    }

    .buttonBox {
        display: flex;
        justify-content: flex-end;
    }

    .textActive {
        color: rgb(0, 189, 247);
    }
    .resultList {
        background-color: #21252b;
        width: 100%;
        position: absolute;
        left: 0;
        top: 212px;
        bottom: 0px;
    }
}
</style>
