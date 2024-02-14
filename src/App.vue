<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import imageView from "./components/imageView.vue";
import custom from "./components/custom.vue";
import rightmenu from "./components/rightmenu.vue";
const menuEl = ref();
const size = computed(() => {
    return menuEl.value && menuEl.value.size ? menuEl.value.size : [0, 0];
});
const colorList = computed(() => {
    return menuEl.value && menuEl.value.colorList ? menuEl.value.colorList : [];
});
const angle = computed(() => {
    return menuEl.value && menuEl.value.angle ? menuEl.value.angle - 0 : 45;
});
const mode = ref(0);
const changeMode = () => {
    mode.value = mode.value == 0 ? 1 : 0;
};
onMounted(() => {
    console.log(menuEl.value.size);
});
</script>

<template>
    <div class="app" v-if="mode == 0">
        <custom
            :width="size[0]"
            :height="size[1]"
            :colorList="colorList"
            :angle="angle"
            @changeMode="changeMode"
        />
        <rightmenu ref="menuEl" />
    </div>
    <div v-else>
        <imageView @changeMode="changeMode" />
    </div>
</template>

<style>
html {
    background: #9a9a9a;
    margin: 0;
    padding: 0;
}
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.app {
    display: flex;
}
</style>
