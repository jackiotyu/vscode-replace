<template>
    <div class="mainBox">
        <vscode-dropdown
            class="selectBox topButMargin"
            v-model="currentCommand"
        >
            <vscode-option
                :value="command.name"
                v-for="command in commands"
                :key="command.name"
                >{{ command.name }}</vscode-option
            >
        </vscode-dropdown>
        <div class="flexBox topButMargin">
            <vscode-text-area
                v-model="currentMatch"
                placeholder="匹配"
                class="matching"
            ></vscode-text-area>
            <vscode-button @click="triggerAdd">匹配</vscode-button>
        </div>
        <div class="flexBox topButMargin">
            <vscode-text-area
                v-model="replaceText"
                class="replaceText"
                placeholder="替换"
            ></vscode-text-area>
        </div>
        <div class="topButMargin">
            <span class="place">包含的文件</span>
            <input
                type="text"
                v-model="includeFile"
                placeholder="例如*.ts、src/"
            />
        </div>
        <div class="topButMargin">
            <span class="place">排除的文件</span>
            <input
                type="text"
                v-model="excludeFile"
                placeholder="例如*.ts、src/"
            />
        </div>
        <div class="buttonBox topButMargin">
            <vscode-button class="btnLeftMargin">保存预设</vscode-button>
            <vscode-button class="btnLeftMargin">替换</vscode-button>
        </div>
        <div class="flexBox topButMargin">
            <span>
                <span class="textActive">{{ filesNum }} </span>个文件匹配到<span
                    class="textActive"
                    >{{ matchesNum }} </span
                >个结果</span
            >
        </div>

        <div class="resultList"></div>
    </div>
</template>

<script lang="ts">
// import { getBaseUri } from '@/utils/common';
import { ref, watch } from 'vue';
import Bus from '@/utils/eventBus';
import { WebviewMsgType, ExtMsgType } from '@ext/src/constants';
import { genID } from '@ext/src/utils/utils';
import { ReplaceCommand } from '@ext/src/common';
// import { vscode } from '@/utils/common';
// const baseUri = getBaseUri();

export default {
    name: 'HomeView',
    setup() {
        let commands = ref<ReplaceCommand[]>([]);
        let currentCommand = ref<string>();
        let currentMatch = ref<string>();
        let replaceText = ref<string>();
        let includeFile = ref<string>();
        let excludeFile = ref<string>();
        let filesNum = ref<number>(0);
        let matchesNum = ref<number>(0);
        Bus.on('extMsg', (message) => {
            console.log('🚀 message >>', message);
            if (message.type === ExtMsgType.COMMANDS) {
                commands.value = message.value || [];
                return;
            }
        });

        function triggerAdd() {
            Bus.emit('sendExt', { type: WebviewMsgType.RELOAD, id: genID() });
        }

        Bus.emit('sendExt', { type: WebviewMsgType.COMMANDS, id: genID() });

        watch(currentCommand, (currentCommand) => {
            console.log('🚀 currentCommand >>', currentCommand);
            let command = (commands.value || []).find(
                (item) => item.name === currentCommand
            );
            currentMatch.value = command?.match;
            // Bus.emit('sendExt', {})
        });

        return {
            replaceText,
            includeFile,
            excludeFile,
            filesNum,
            matchesNum,
            triggerAdd,
            commands,
            currentCommand,
            currentMatch,
        };
    },
};
</script>
<style lang="scss">
.topButMargin {
    margin: 4px 0px;
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
    display: flex;
    flex-direction: column;

    .selectBox {
        width: 100%;
        background-color: #1d1f23;
    }

    .flexBox {
        display: flex;
        justify-content: space-between;
    }

    .matching {
        flex: 1;
        margin-right: 6px;
        height: 50px;
    }
    .replaceText {
        flex: 1;
        height: 50px;
    }
    .place {
        display: inline-block;
        margin-bottom: 4px;
        line-height: 11px;
        font-size: 11px;
    }

    .buttonBox {
        display: flex;
        justify-content: flex-end;
    }

    .textActive {
        color: rgb(0, 189, 247);
    }

    .resultList {
        background-color: #1d1f23;
        flex: 1;
    }
}
</style>
