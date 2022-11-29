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
            <vscode-button class="matchingBtn" @click="triggerMatch"
                >匹配</vscode-button
            >
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
                @input="changeIncludeExp"
                placeholder="例如*.ts、src/"
            />
        </div>
        <div class="topButMargin">
            <span class="place">排除的文件</span>
            <input
                type="text"
                v-model="excludeFile"
                @input="changeExcludeExp"
                placeholder="例如*.ts、src/"
            />
        </div>
        <div class="buttonBox topButMargin">
            <input
                class="setRuleName"
                type="text"
                v-model="currentRuleName"
                placeholder="请输入预设规则名"
            />
            <vscode-button class="btnLeftMargin">保存预设</vscode-button>
            <vscode-button class="btnLeftMargin" @click="triggerReplace"
                >替换</vscode-button
            >
        </div>
        <div class="flexBox topButMargin">
            <span>
                <span class="textActive">{{ filesNum }} </span>个文件匹配到<span
                    class="textActive"
                    >{{ matchesNum }} </span
                >个结果</span
            >
        </div>
    </div>
</template>

<script lang="ts">
// import { getBaseUri } from '@/utils/common';
import { ref, watch } from 'vue';
import Bus, { sendMsg } from '@/utils/eventBus';
import { MsgType } from '@ext/src/constants';
import { genID } from '@ext/src/utils/utils';
import { ReplaceCommand } from '@ext/src/common';
import { debounce } from 'lodash';
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
        let currentRuleName = ref<string>();

        let filesNum = ref<number>(0);
        let matchesNum = ref<number>(0);

        // 发送匹配命令
        function triggerMatch() {
            sendMsg({
                type: MsgType.MATCH,
                id: genID(),
                value: currentMatch.value,
            });
        }

        // 发送替换命令
        function triggerReplace() {
            sendMsg({
                type: MsgType.REPLACE,
                id: genID(),
                value: replaceText.value,
            });
        }

        const changeIncludeExp = debounce(() => {
            sendMsg({
                type: MsgType.INCLUDE,
                id: genID(),
                value: includeFile.value,
            });
        }, 300);
        const changeExcludeExp = debounce(() => {
            sendMsg({
                type: MsgType.EXCLUDE,
                id: genID(),
                value: excludeFile.value,
            });
        }, 300);

        watch(
            currentCommand,
            (currentCommand) => {
                let command = (commands.value || []).find(
                    (item) => item.name === currentCommand
                );
                currentMatch.value = command?.match;
                replaceText.value = command?.replace;
                // Bus.emit('sendExt', {})
            },
            { immediate: true }
        );

        sendMsg({ type: MsgType.COMMANDS, id: genID() }).then((message) => {
            console.log(message, 'res');
            commands.value = message.value || [];
            currentCommand.value = commands.value?.[0]?.name;
            sendMsg({
                type: MsgType.MATCH,
                id: genID(),
                value: currentMatch.value,
            });
        });

        Bus.on('matchResultMsg', (data) => {
            filesNum.value = data?.value?.count || 0;
            matchesNum.value = data?.value?.count || 0;
        });

        return {
            replaceText,
            includeFile,
            excludeFile,
            filesNum,
            matchesNum,
            currentRuleName,
            triggerMatch,
            triggerReplace,
            changeIncludeExp,
            changeExcludeExp,
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
    height: 29px;
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
    .matchingBtn {
        height: 29px;
        margin: auto 0px;
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
        .setRuleName {
            height: 29px;
            flex: 1;
        }
    }

    .textActive {
        color: rgb(0, 189, 247);
    }
}
</style>
