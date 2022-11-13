<template>
    <div class="mainBox">
        <h1 ref="ref1">{{ msg }}</h1>
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
            <input
                v-model="currentMatch"
                type="text"
                placeholder="匹配"
                class="matching"
            />
            <vscode-button @click="triggerAdd">匹配</vscode-button>
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
import { ref, watch } from 'vue';
import Bus from '@/utils/eventBus';
import { WebviewMsgType, ExtMsgType } from '@ext/src/constants';
// import { vscode } from '@/utils/common';
// const baseUri = getBaseUri();

export default {
    name: 'HomeView',
    setup() {
        let msg = ref('JS Replace');
        let commands = ref<ReplaceCommand[]>([]);
        let currentCommand = ref<string>();
        let currentMatch = ref<string>();

        Bus.on('extMsg', (message: any) => {
            console.log('🚀 message >>', message);
            if (message.type === ExtMsgType.COMMANDS) {
                commands.value = message.value || [];
                return;
            }
        });

        function triggerAdd() {
            Bus.emit('sendExt', { type: 'reload', value: '1234' });
        }

        function handleSelect(e: any) {
            console.log('🚀 e >>', e);
        }

        Bus.emit('sendExt', { type: WebviewMsgType.COMMANDS });

        watch(currentCommand, (currentCommand) => {
            console.log('🚀 currentCommand >>', currentCommand);
            let command = (commands.value || []).find(
                (item) => item.name === currentCommand
            );
            currentMatch.value = command?.match;
            // Bus.emit('sendExt', {})
        });

        return {
            msg,
            triggerAdd,
            commands,
            handleSelect,
            currentCommand,
            currentMatch,
        };
    },
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
