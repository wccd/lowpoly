<script setup lang="ts">
import { computed, ref } from "vue";
const direction = ref(0);
const directList = [
    {
        id: 0,
        value: 0,
        label: "16:9",
    },
    {
        id: 1,
        value: 1,
        label: "9:16",
    },
    {
        id: 2,
        value: 2,
        label: "1:1",
    },
];

const quaily = ref(1);
const quailyList = [
    {
        id: 0,
        value: 0,
        label: "2k普通",
    },
    {
        id: 1,
        value: 1,
        label: "4k高清",
    },
];

const angle = ref("45");

const size = computed(() => {
    // 1920 * 1080   2560 * 1440
    if (direction.value == 2) {
        return quaily.value == 1 ? [2048, 2048] : [1024, 1024];
    }
    const w = quaily.value == 1 ? 2560 : 1920;
    const h = quaily.value == 1 ? 1440 : 1080;
    return direction.value == 0 ? [w, h] : [h, w];
});

const colorList = ref(["#223e9f", "#c2ffd6", "#29e0b0"]);
function getRandomColor() {
    const list = [
        "#61649f",
        "#1661ab",
        "#2376b7",
        "#5698c3",
        "#29b7cb",
        "#1ba784",
        "#45b787",
        "#229453",
        "#43b244",
        "#96c24e",
        "#fed71a",
        "#f1ca17",
        "#fcd337",
        "#f6c430",
        "#fbb612",
        "#f26b1f",
    ];
    const maxIndex = list.length - 1;
    let seed = Math.floor(Math.random() * maxIndex);
    return list[seed];
}
const addColor = () => {
    colorList.value.push(getRandomColor());
};
const setColor = (index: number, event: any) => {
    let color = event.target.value;
    colorList.value[index] = color;
};
const reduceColor = () => {
    if (colorList.value.length == 2) return;
    colorList.value.splice(colorList.value.length - 1, 1);
};
defineExpose({
    size,
    colorList,
    angle,
});
</script>
<template>
    <div class="menu-bar">
        <div class="menu-line">
            <p>方向</p>
            <select v-model="direction">
                <option
                    v-for="item in directList"
                    :key="item.id"
                    :value="item.value"
                >
                    {{ item.label }}
                </option>
            </select>
        </div>
        <div class="menu-line">
            <p>质量</p>
            <select v-model="quaily">
                <option
                    v-for="item in quailyList"
                    :key="item.id"
                    :value="item.value"
                >
                    {{ item.label }}
                </option>
            </select>
        </div>
        <div class="menu-line">
            <p>渐变角度</p>
            <input type="range" min="0" max="360" step="5" v-model="angle" />
            <p>{{ angle }}</p>
        </div>
        <div class="menu-line">
            <p>颜色</p>
            <div class="color-list">
                <div class="color-btn" @click="addColor">+1</div>
                <div class="color-btn" @click="reduceColor">-1</div>
                <div
                    class="color-box"
                    v-for="(item, index) in colorList"
                    :key="item"
                >
                    <input
                        type="color"
                        :value="item"
                        @change="setColor(index, $event)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="stylus">
.menu-bar
    width 30%
    height 100vh
    padding 16px
    background #fff
    .menu-line
        display flex
        flex-wrap: wrap
        align-items: center
        column-gap 16px
        font-size 14px
        color #222
        margin-bottom: 16px
        p
            flex-shrink: 0
            align-self: flex-start
        select
            height 24px
            width 200px
            outline: none
            border 1px solid #b7b7b7
            border-radius: 4px
        .color-list
            display: flex
            flex-wrap: wrap
            column-gap: 10px
            row-gap: 10px
            .color-box
                width 32px
                height 32px
                input
                    width 100%
                    outline none
                    border none
                    width 100%
                    height 100%
            .color-btn
                display: flex
                justify-content: center
                align-items: center
                width 32px
                height 32px
                border 1px solid #e3e3e3
                border-radius 6px
                cursor pointer
                user-select: none
@media screen and (max-width: 500px)
    .menu-bar
        position absolute
        left 0
        bottom 0
        width 100%
        height 120px
        overflow auto
</style>
