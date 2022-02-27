<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ref,onMounted, defineExpose } from 'vue'
import Sobel from 'Sobel'
import Delaunay from './utils/delaunay.js'

let imgBlob: Blob
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
function zipImg(imageData: any) {

}


// point array
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
  let imageData = await loadImg(blob)
  let pointNum= imageData.width * imageData.height / 100,
      marginPointNum = pointNum * 9 / 10,
      randomPointNum = pointNum * 1 / 10;

  let sobelData = Sobel(imageData);
  let sobelImageData = sobelData.toImageData();

  let arr = getPointList(imageData, sobelImageData);
  let marginList = randomMarginPoint(arr, marginPointNum); // 获取原图边缘上随机点
  let randomList = randomPoint(imageData, randomPointNum); // 获取原图上随机点

  return {
    imageData: imageData,
    pointData: randomList.concat(marginList),
  }
}

// draw
async function drawCanvas(blob: Blob) {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  let {imageData, pointData} = await sobelImg(blob);
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData,0,0)
  canvas.style.cssText = "width: 48%"
  document.body.appendChild(canvas)

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
  canvas.style.cssText = "width: 48%;margin-left: 4%"
  canvas.toBlob((data: Blob | null) => {
    imgBlob = data!;
  })
  document.body.appendChild(canvas)
}


const selector = ref();

const selectFile = () => {
  selector.value.click()
}

const changeFile = (e: any) => {
  let files = e.target.files;
  drawCanvas(files[0])
}

const saveToImg = () => {
  var a = document.createElement('a')
  var url = window.URL.createObjectURL(imgBlob)
  a.href = url
  a.download = Math.floor(Math.random() * 100000) + '.png'
  a.click()
  window.URL.revokeObjectURL(url)
}

defineExpose({
  selectFile,
  saveToImg,
  changeFile
})



</script>

<template>
  <div class="btn" @click="selectFile">选择图片</div>
  <div class="btn" style="left: calc(80% - 80px)" @click="saveToImg">存为图片</div>
  <input type="file" ref="selector" style="display: none" @change="changeFile">
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
html {
  background: #9a9a9a;

}
.btn {
  position: absolute;
  left: calc(50% - 80px);
  bottom: 100px;
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
</style>
