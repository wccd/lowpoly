<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref, onMounted, defineExpose, reactive, nextTick } from "vue";
import Sobel from "Sobel";
import Delaunay from "../utils/delaunay.js";
import { calcAngleLinearGradient } from "../utils/calcAngleLinearGradient";

const props = defineProps({
    width: {
        type: Number,
        default: 0,
    },
    height: {
        type: Number,
        default: 0,
    },
    angle: {
        type: Number,
        default: 0,
    },
    colorList: {
        type: Array,
        default: [],
    },
});

let tempData: any = {
    originFile: null,
    imageData: null,
    saveData: null,
};
function resetTemp() {
    tempData = {
        originFile: null,
        imageData: null,
        saveData: null,
    };
}
// tool
function toHex(r: number, g: number, b: number) {
    let hex = `#${((1 << 24) + (r << 16) + (b << 8) + b)
        .toString(16)
        .slice(1)}`;
    return hex;
}
function getPxColor(imageData: any, x: number, y: number, width: number) {
    let iData = imageData.data;
    let position = (width * y + x) * 4;
    var r = iData[position],
        g = iData[position + 1],
        b = iData[position + 2],
        a = iData[position + 3];
    // return toHex(r, g, b)
    return [r, g, b, a];
}
function toInt(num: number) {
    return num < 1 ? Math.round(num * 1000) / 1000 : Math.round(num);
}

// image
async function loadImg(blob: Blob) {
    let img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    const loaded = new Promise((resolve, reject) => {
        img.onload = () => resolve({});
        img.onerror = () => reject(Error("Image loading error"));
    });
    await loaded;
    let width = img.width,
        height = img.height;
    const canvas = document.createElement("canvas");
    if (width * height > 1024 * 1024) {
        if (width > height) {
            height = (1024 * height) / width;
            width = 1024;
        } else {
            width = (1024 * width) / height;
            height = 1024;
        }
    }
    canvas.width = width;
    canvas.height = height;
    // Draw image onto canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    URL.revokeObjectURL(url);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    let imageData = ctx.getImageData(0, 0, width, height);
    return imageData;
}

// point array
const userDefault = ref(false),
    pointRange = ref([0, 1000]),
    userPointNum = ref(1),
    userMarginRandom = ref(1);
function resetPrefer() {
    userDefault.value = false;
    pointRange.value = [0, 1000];
    userPointNum.value = 1;
    userMarginRandom.value = 1;
}
function getPointList(imageData: any, sobelImageData: any) {
    let gap = 1;
    let arr = [];
    let width = imageData.width,
        height = imageData.height,
        sData = sobelImageData.data;
    for (let h = 0; h < height; h += gap) {
        for (let w = 0; w < width; w += gap) {
            let position = (width * h + w) * 4;
            var r = sData[position],
                g = sData[position + 1],
                b = sData[position + 2];
            if (r + g + b <= 255) {
                continue;
            } else {
                arr.push([w, h]);
            }
        }
    }
    return arr;
}
function randomMarginPoint(arr: Array<any>, marginNum: number) {
    let randomArr = [];
    let cache: any = [];
    for (let i = 0; i < marginNum; i++) {
        let index = Math.floor(Math.random() * arr.length);
        while (cache.includes(index)) {
            index = Math.floor(Math.random() * arr.length);
            cache.push(index);
        }
        randomArr.push(arr[index]);
    }
    return randomArr;
}
function randomPoint(imageData: any, randomNum: number) {
    let w = imageData.width - 1,
        h = imageData.height - 1,
        num = randomNum - 4,
        cache: any = [],
        arr = [];
    arr = [
        [0, 0],
        [0, h],
        [w, 0],
        [w, h],
    ];
    for (let i = 0; i < num; i++) {
        let x = Math.floor(Math.random() * w);
        let y = Math.floor(Math.random() * h);
        let list = [x, y],
            listStr = list.toString();
        while (cache.includes(listStr)) {
            x = Math.floor(Math.random() * w);
            y = Math.floor(Math.random() * h);
            (list = [x, y]), (listStr = list.toString());
            cache.push(listStr);
        }
        arr.push(list);
    }
    return arr;
}

function randomPoint2(imageData: any, randomNum: number) {
    let w = imageData.width - 1,
        h = imageData.height - 1,
        arr = [];
    arr = [
        [0, 0],
        [0, h],
        [w, 0],
        [w, h],
    ];
    // 拓展边缘点
    const getRectPoints = (w = 0, h = 0) => {
        let xCount = Math.sqrt(randomNum),
            yCount = Math.sqrt(randomNum);
        for (let i = 0; i < xCount; i++) {
            let num = Math.round((i * w) / xCount);
            if (num > 0) {
                arr.push([num, 0]);
                arr.push([num, h]);
            }
        }
        for (let i = 0; i < yCount; i++) {
            let num = Math.round((i * h) / yCount);
            if (num > 0) {
                arr.push([0, num]);
                arr.push([w, num]);
            }
        }
    };
    getRectPoints(w, h);

    const interval = Math.round(Math.sqrt(randomNum));
    let intervalX = w / interval,
        intervalY = h / interval;
    for (let i = 0; i < interval; i++) {
        for (let j = 0; j < interval; j++) {
            arr.push([
                Math.floor((i + Math.random()) * intervalX),
                Math.floor((j + Math.random()) * intervalY),
            ]);
        }
    }
    return arr;
}

// draw
function cleanDraw() {
    orginImg.value.innerHTML = "";
    lowpolyImg.value.innerHTML = "";
}

function getRandomColor() {
    const list = ["#c02c38", "#7e1671", "#2775b6", "#66c18c", "#eed045"];
    const maxIndex = list.length - 1;
    let seed = Math.floor(Math.random() * maxIndex);
    return list[seed];
}

function toDelaunay(imageData: any, vertices: any) {
    let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d")!;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var triangles: any = Delaunay.triangulate(vertices);
    for (var i = triangles.length; i; ) {
        ctx.beginPath();
        --i;
        ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        let color1 = getPxColor(
            imageData,
            vertices[triangles[i]][0],
            vertices[triangles[i]][1],
            imageData.width
        );
        --i;
        ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        let color2 = getPxColor(
            imageData,
            vertices[triangles[i]][0],
            vertices[triangles[i]][1],
            imageData.width
        );
        --i;
        ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
        let color3 = getPxColor(
            imageData,
            vertices[triangles[i]][0],
            vertices[triangles[i]][1],
            imageData.width
        );
        let r = (color1[0] + color2[0] + color3[0]) / 3;
        let g = (color1[1] + color2[1] + color3[1]) / 3;
        let b = (color1[2] + color2[2] + color3[2]) / 3;
        let a = (color1[3] + color2[3] + color3[3]) / 3;
        let color = `rgba(${r}, ${g}, ${b}, ${color1[3]})`;

        // 使用随机色
        // color = getRandomColor()

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
    }
    canvas.toBlob((data: Blob | null) => {
        tempData.saveData = data!;
    });
    lowpolyImg.value.appendChild(canvas);
}

const orginImg = ref();
const lowpolyImg = ref();
const imageNum = ref(1);

const saveToImg = () => {
    var a = document.createElement("a");
    var url = window.URL.createObjectURL(tempData.saveData);
    a.href = url;
    a.download = Math.floor(Math.random() * 100000) + ".png";
    a.click();
    window.URL.revokeObjectURL(url);
};

const switchImg = () => {
    imageNum.value = !!imageNum.value ? 0 : 1;
    console.log(imageNum.value);
};

const colorList = ref([]) as any;
const addColor = (str = "") => {
    colorList.value.push(str);
};
const createLinear = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const calcRect = () => {
        // todo any angle
        let angle = props.angle;
        let tanStr = Math.tan((angle / 180) * Math.PI);
        if (angle == 0) {
            return [0, 0, w, 0];
        } else if (angle == 90) {
            return [0, 0, 0, h];
        }
        return [0, 0, w * tanStr, h * tanStr];
    };
    let rect = calcAngleLinearGradient(props.angle, w, h);
    // const rect = calcRect();
    console.log(rect);
    const linearGradient = ctx.createLinearGradient(
        rect[0],
        rect[1],
        rect[2],
        rect[3]
    );
    const len = colorList.value.length;
    for (let i = 0; i < len; i++) {
        let step = i / (len - 1);
        linearGradient.addColorStop(step, colorList.value[i]);
    }
    ctx.fillStyle = linearGradient;
    ctx.fillRect(0, 0, w, h);
};
const userSeed = ref(20); // .1 - 10

const drawBg = () => {
    cleanDraw();
    const w = props.width,
        h = props.height;
    colorList.value = [];
    for (let color of props.colorList) {
        color && addColor(color as string);
    }
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d")!;
    canvas.width = w;
    canvas.height = h;
    createLinear(ctx, w, h);
    orginImg.value.appendChild(canvas);

    let imageData = ctx.getImageData(0, 0, w, h);
    const pointNum = Math.floor((w * h) / 1024 / userSeed.value);
    let pointData = randomPoint2(imageData, pointNum);
    // test point
    // for (let i = 0; i < pointData.length; i++) {
    //     ctx.fillStyle = "#000";
    //     ctx.fillRect(pointData[i][0], pointData[i][1], 5, 5);
    // }
    toDelaunay(imageData, pointData);
};
const emit = defineEmits(["changeMode"]);
const changeMode = () => {
    emit("changeMode");
};

defineExpose({
    saveToImg,
    switchImg,
});
</script>

<template>
    <div class="show-box">
        <div
            class="origin-img img-box"
            ref="orginImg"
            v-show="imageNum == 0"
        ></div>
        <div
            class="lowpoly-img img-box"
            ref="lowpolyImg"
            v-show="imageNum == 1"
        ></div>
    </div>
    <div class="bottom-box">
        <div class="btn-box">
            <div class="btn" @click="drawBg">生成</div>
            <div class="btn" @click="saveToImg">存为图片</div>
            <div class="btn" @click="switchImg">切换图片</div>
            <div class="btn" @click="changeMode">切换模式</div>
        </div>
    </div>
</template>

<style>
html {
    background: #9a9a9a;
    margin: 0;
    padding: 0;
}
div,
body,
p {
    margin: 0;
    padding: 0;
}
.show-box {
    width: 100vw;
    height: calc(100vh - 180px);
    display: flex;
    justify-content: space-around;
    align-content: center;
    padding: 15px;
    box-sizing: border-box;
}
.img-box {
    width: 100%;
}
.img-box canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
