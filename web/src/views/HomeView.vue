<template>
    <div class="home">
        <img alt="Vue logo" :src="`${baseUri}/img/icon.png`" />
        <HelloWorld msg="试试" />
    </div>
</template>

<script setup lang="ts">
import { getBaseUri } from '@/utils/common';

import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
const baseUri = getBaseUri();
</script>
