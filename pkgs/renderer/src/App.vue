<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
    <div class="fixed top-0 w-screen h-10 pointer-events-none drag-window"></div>
    <div class="h-full w-75">
        <div class="h-8"></div>
        <router-view name="side"></router-view>
    </div>
    <div class="h-full flex-1">
        <router-view name="content"></router-view>
    </div>
</template>
