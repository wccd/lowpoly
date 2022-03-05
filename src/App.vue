<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref,onMounted, defineExpose, reactive, nextTick } from 'vue'
import Sobel from 'Sobel'
import Delaunay from './utils/delaunay.js'

let tempData:any = {
  originFile: null,
  imageData: null,
  saveData: null,
}
function resetTemp() {
  tempData = {
    originFile: null,
    imageData: null,
    saveData: null,
  }
}
// tool
function toHex(r:number, g:number, b:number) {
    let hex = `#${((1 << 24) + (r << 16) + (b << 8) + b).toString(16).slice(1)}`;
    return hex
}
function getPxColor(imageData:any, x: number, y:number, width: number) {
  let iData = imageData.data;
  let position = (width * y + x) * 4
  var r = iData[position], g = iData[position + 1], b = iData[position + 2], a = iData[position + 3];
  // return toHex(r, g, b)
  return [r,g,b,a]
}
function toInt(num: number) {
  return num < 1 ? Math.round(num * 1000) / 1000 : Math.round(num)
}

// image
async function loadImg(blob: Blob) {
  let img = new Image();
  const url = URL.createObjectURL(blob);
  img.src = url;
  const loaded = new Promise((resolve, reject) => {
      img.onload = () => resolve({});
      img.onerror = () => reject(Error('Image loading error'));
  });
  await loaded
  let width = img.width,
      height = img.height;
  const canvas = document.createElement('canvas');
  if(width * height > 1024 * 1024) {
    if(width > height) {
      height = 1024 * height / width;
      width = 1024;
    } else {
      width = 1024 * width / height;
      height = 1024;
    }
  }
  canvas.width = width;
  canvas.height = height;
  // Draw image onto canvas
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  URL.revokeObjectURL(url);
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
  let imageData = ctx.getImageData(0, 0, width, height);
  return imageData
}


// point array
const userDefault = ref(false),
      pointRange = ref([0,1000]),
      userPointNum = ref(1),
      userMarginRandom = ref(1);
function resetPrefer() {
  userDefault.value = false;
  pointRange.value = [0,1000];
  userPointNum.value = 1
  userMarginRandom.value = 1
}
function getPointList(imageData:any, sobelImageData:any) {
  let gap = 1;
  let arr = [];
  let width = imageData.width,
      height = imageData.height,
      sData = sobelImageData.data;
  for(let h = 0; h < height; h += gap) {
    for(let w = 0; w < width; w += gap) {
      let position = (width * h + w) * 4
      var r = sData[position], g = sData[position + 1], b = sData[position + 2];
      if(r + g + b <= 255) {
        continue
      } else {
        arr.push([
          w,
          h,
        ])
      }
    }
  }
  return arr
}
function randomMarginPoint(arr: Array<any>, marginNum: number) {
  let randomArr = []
  let cache:any = [];
  for(let i = 0; i < marginNum; i++) {
    let index = Math.floor(Math.random() * arr.length);
    while(cache.includes(index)) {
      index = Math.floor(Math.random() * arr.length);
      cache.push(index);
    }
    randomArr.push(arr[index])
  }
  return randomArr
}
function randomPoint(imageData: any, randomNum: number) {
  let w = imageData.width - 1,
      h = imageData.height - 1,
      num =  randomNum - 4,
      cache:any = [],
      arr = [];
  arr = [
    [0, 0], 
    [0, h], 
    [w, 0], 
    [w, h]
  ]
  for(let i = 0; i < num; i++) {
    let x = Math.floor(Math.random() * w);
    let y = Math.floor(Math.random() * h);
    let list = [x, y],
        listStr = list.toString();
    while(cache.includes(listStr)) {
      x = Math.floor(Math.random() * w);
      y = Math.floor(Math.random() * h);
      list = [x, y],
      listStr = list.toString();
      cache.push(listStr);
    }
    arr.push(list)
  }
  return arr
}

async function sobelImg(blob: Blob) {
  let imageData, pointNum: number, marginPointNum, randomPointNum;
  if(!tempData.imageData) {
    imageData = await loadImg(blob)
    tempData.imageData = imageData;
  } else {
    console.log('use cache')
    imageData = tempData.imageData;
  }

  pointNum = imageData.width * imageData.height / 100;
  pointRange.value = [pointNum / 10, pointNum];
  marginPointNum = pointNum * 90,
  randomPointNum = pointNum * 10;

  if(userDefault.value) {
    marginPointNum = userPointNum.value * userMarginRandom.value;
    randomPointNum = userPointNum.value * (100 - userMarginRandom.value);
  } else {
    nextTick(() => {
      userPointNum.value = pointNum;
      userMarginRandom.value = 90;
    })
  }
  

  let sobelData = Sobel(imageData);
  let sobelImageData = sobelData.toImageData();

  let arr = getPointList(imageData, sobelImageData);
  let marginList = randomMarginPoint(arr, marginPointNum / 100); // 获取原图边缘上随机点
  let randomList = randomPoint(imageData, randomPointNum / 100); // 获取原图上随机点

  return {
    imageData: imageData,
    pointData: randomList.concat(marginList),
  }
}

// draw
function cleanDraw() {
  orginImg.value.innerHTML = ''
  lowpolyImg.value.innerHTML = ''
}
async function drawCanvas(blob: Blob) {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  let {imageData, pointData} = await sobelImg(blob);
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData,0,0)
  orginImg.value.appendChild(canvas)

  toDelaunay(imageData, pointData)
}

function toDelaunay(imageData:any, vertices: any) {
  let canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d")!;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  var triangles:any = Delaunay.triangulate(vertices);
  for(var i = triangles.length; i; ) {
    ctx.beginPath();
    --i; ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
    let color1 = getPxColor(imageData, vertices[triangles[i]][0], vertices[triangles[i]][1], imageData.width);
    --i; ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
    let color2 = getPxColor(imageData, vertices[triangles[i]][0], vertices[triangles[i]][1], imageData.width);
    --i; ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
    let color3 = getPxColor(imageData, vertices[triangles[i]][0], vertices[triangles[i]][1], imageData.width);
    let r = (color1[0] + color2[0] + color3[0]) / 3;
    let g = (color1[1] + color2[1] + color3[1]) / 3;
    let b = (color1[2] + color2[2] + color3[2]) / 3;
    let a = (color1[3] + color2[3] + color3[3]) / 3;
    let color = `rgba(${r}, ${g}, ${b}, ${color1[3]})`
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.fill()
    ctx.closePath();
    ctx.stroke();
  }
  canvas.toBlob((data: Blob | null) => {
    tempData.saveData = data!;
  })
  lowpolyImg.value.appendChild(canvas)
}


const selector = ref();
const orginImg = ref();
const lowpolyImg = ref();

const selectFile = () => {
  resetTemp();
  resetPrefer();
  selector.value.click()
}

const changeFile = (e: any) => {
  cleanDraw();
  let files = e.target.files;
  tempData.originFile = files;
  drawCanvas(files[0]);
  e.target.value = null;
}

const changePointNum = () => {
  userDefault.value = true;
  cleanDraw();
  drawCanvas(tempData.originFile)
}

const changeMarginRandom = () => {
  userDefault.value = true;
  cleanDraw();
  drawCanvas(tempData.originFile)
}

const saveToImg = () => {
  var a = document.createElement('a')
  var url = window.URL.createObjectURL(tempData.saveData)
  a.href = url
  a.download = Math.floor(Math.random() * 100000) + '.png'
  a.click()
  window.URL.revokeObjectURL(url)
}

defineExpose({
  selectFile,
  saveToImg,
  changeFile,
  changePointNum,
  changeMarginRandom,
})


</script>

<template>
  <input type="file" ref="selector" style="display: none" @change="changeFile">
  <div class="show-box">
    <div class="origin-img img-box" ref="orginImg"></div>
    <div class="lowpoly-img img-box" ref="lowpolyImg"></div>
  </div>
  <div class="slider">
    <div class="slider-input">
      <p>点数 点数越多色块越密集({{ toInt(userPointNum) }})</p>
      <input type="range" :min="pointRange[0]" :max="pointRange[1]" v-model="userPointNum" @change="changePointNum">
    </div>
    <div class="slider-input">
      <p>边缘随机点数比,0-1越大轮廓越清晰({{ userMarginRandom / 100 }})</p>
      <input type="range" min="1" v-model="userMarginRandom" @change="changeMarginRandom">
    </div>
  </div>
  <div class="btn-box">
    <div class="btn" @click="selectFile">选择图片</div>
    <div class="btn" style="left: calc(80% - 80px)" @click="saveToImg">存为图片</div>
  </div>
</template>

<style>
html {
  background: #9a9a9a;
  margin: 0;
  padding: 0;
}
div,body,p {
  margin: 0;
  padding: 0;
}
.show-box {
  width: 100vw;
  height: calc(100vh - 80px - 80px);
  display: flex;
  justify-content: space-around;
  align-content: center;
  padding-top: 30px;
  box-sizing: border-box;
}
.img-box {
  width: 48%;
}
.img-box canvas {
  width: 100%;
}
.btn-box {
  width: 100vw;
  height: 80px;
  display: flex;
  justify-content: center;
}
.btn-box :first-child {
  margin-right: 30px;
}
.btn {
  width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  background: #017fff;
  cursor: pointer;
}
.slider {
  height: 80px;
  width: 100vw;
  display: flex;
  justify-content: center;
}
.slider :first-child {
  margin-right: 30px;
}
.slider-input {
  height: 40px;
  width: 30%;
}
.slider-input p {
  font-size: 14px;
  margin-bottom: 10px;
}
.slider-input input {
  width: 100%;
}
</style>
