<template>
    <div class="mainBox">
        <vscode-dropdown
            class="selectBox topButMargin"
            v-model="currentCommandName"
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
            <vscode-button class="matchingBtn" @click="triggerMatch">{{
                isMatching ? '停止匹配' : '匹配'
            }}</vscode-button>
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
            <vscode-button
                class="btnLeftMargin"
                :disabled="!currentRuleName"
                @click="triggerSaveRule"
                >保存预设</vscode-button
            >
            <vscode-button
                class="btnLeftMargin"
                :disabled="isLoading || !filesNum"
                @click="triggerReplace"
                >替换</vscode-button
            >
        </div>
        <div class="flexBox topButMargin" v-if="filesNum">
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import Bus, { sendMsg } from '@/utils/eventBus';
import {
    ExtCommandsPayload,
    ExtMatchResultPayload,
    MsgType,
} from '@ext/src/constants';
import { genID } from '@ext/src/utils/utils';
import { ReplaceCommand } from '@ext/src/common';
import { debounce } from 'lodash';
// import { vscode } from '@/utils/common';
// const baseUri = getBaseUri();

export default {
    name: 'HomeView',
    setup() {
        let commands = ref<ReplaceCommand[]>([]);
        let currentCommandName = ref<string>();
        let currentMatch = ref<string>();
        let replaceText = ref<string>();
        let includeFile = ref<string>();
        let excludeFile = ref<string>();
        let currentRuleName = ref<string>();
        // TODO 任务执行中的状态
        let isLoading = ref<boolean>(false);
        let isMatching = ref<boolean>(false);
        let currentCommand = ref<ReplaceCommand>();
        let filesNum = ref<number>(0);
        let matchesNum = ref<number>(0);

        // 发送匹配命令
        function triggerMatch() {
            if (isMatching.value) {
                sendMsg({
                    type: MsgType.STOP_MATCH,
                    id: genID(),
                }).then(() => {
                    isMatching.value = false;
                });
            } else {
                isMatching.value = true;
                sendMsg({
                    type: MsgType.MATCH,
                    id: genID(),
                    value: currentMatch.value,
                }).then(() => {
                    isMatching.value = false;
                });
            }
        }

        // 发送替换命令
        function triggerReplace() {
            sendMsg({
                type: MsgType.REPLACE,
                id: genID(),
                value: replaceText.value,
            });
        }
        // 保存预设
        function triggerSaveRule() {
            if (currentCommand.value && currentRuleName.value) {
                let ruleName = currentRuleName.value;
                sendMsg({
                    type: MsgType.SAVE_RULE,
                    id: genID(),
                    value: {
                        rule: {
                            ...currentCommand.value,
                            match: currentMatch.value || '',
                            replace: replaceText.value || '',
                            name: currentRuleName.value,
                        },
                        oldRuleName: currentCommandName.value,
                    },
                }).then(() => {
                    currentCommandName.value = ruleName;
                });
            }
        }

        const changeIncludeExp = debounce(() => {
            sendMsg({
                type: MsgType.INCLUDE,
                id: genID(),
                value: includeFile.value,
            });
            isLoading.value = true;
        }, 300);
        const changeExcludeExp = debounce(() => {
            sendMsg({
                type: MsgType.EXCLUDE,
                id: genID(),
                value: excludeFile.value,
            });
            isLoading.value = true;
        }, 300);

        watch(
            currentCommandName,
            (currentCommandName) => {
                let command = (commands.value || []).find(
                    (item) => item.name === currentCommandName
                );
                currentCommand.value = command;
                currentMatch.value = command?.match;
                replaceText.value = command?.replace;
                currentRuleName.value = currentCommandName;
                sendMsg({
                    type: MsgType.CLEAR_MATCH,
                    id: genID(),
                });
            },
            { immediate: true }
        );

        watch(
            replaceText,
            debounce((replaceText: string | undefined) => {
                sendMsg({
                    type: MsgType.CHANGE_REPLACE,
                    id: genID(),
                    value: replaceText,
                });
            }, 300)
        );

        function commandsCallback(message: ExtCommandsPayload) {
            let newCommands = message.value || [];
            if (currentCommandName.value) {
                currentCommand.value = newCommands.find(
                    (i) => i.name === currentCommandName.value
                );
            }
            if (!currentCommand.value) {
                currentCommand.value = newCommands?.[0];
            }
            commands.value = newCommands;
            let commandName = currentCommand.value?.name;
            currentCommandName.value = undefined;
            nextTick(() => {
                currentCommandName.value = commandName;
                currentRuleName.value = currentCommandName.value;
            });
        }

        function matchResultCallback(data: ExtMatchResultPayload) {
            filesNum.value = data?.value?.file || 0;
            matchesNum.value = data?.value?.count || 0;
            isLoading.value = false;
        }

        onMounted(() => {
            Bus.on('commands', commandsCallback);
            Bus.on('matchResultMsg', matchResultCallback);
            sendMsg({ type: MsgType.COMMANDS, id: genID() });
        });

        onUnmounted(() => {
            Bus.off('matchResultMsg', matchResultCallback);
            Bus.off('commands', commandsCallback);
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
            triggerSaveRule,
            changeIncludeExp,
            changeExcludeExp,
            commands,
            currentCommandName,
            currentMatch,
            isLoading,
            isMatching,
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
