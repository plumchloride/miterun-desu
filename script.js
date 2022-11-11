//  ===========================
//  顔認識
//  ===========================

const videoElement = document.getElementsByClassName('input_video')[0];
const $canvasElements = document.getElementsByClassName('output_canvas');
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const $canvas_wrap = document.getElementById("canvases")
const canvasCtx = canvasElement.getContext('2d');
const $cam = {"on":document.getElementById("cam_on"),"off":document.getElementById("cam_off")}

let on_cam = false;
let show_face = true;
let send_count = 0;
let kirisute_num = 2;
let dec_eye = true;
let close_val = 5;
let eye_close = {"l":false,"r":false}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.scale(-1, 1)
  canvasCtx.translate(-canvasElement.width, 0)
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if(show_face){
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)
  }else{
    canvasCtx.fillStyle = "#529DF1";
    canvasCtx.beginPath();
    canvasCtx.rect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.fill();
  }
  if (results.multiFaceLandmarks) {
    dectation = false
    for (const landmarks of results.multiFaceLandmarks) {
      dectation = true
      // landmarks {x,y,z} * 478
      // FACEMESH 1 to 2 に線を引くって言う意味
      // すべて表示
      if(dec_eye){
        // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,{color: '#C0C0C070', lineWidth: 0.5});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30', lineWidth: 1});
        // drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0', lineWidth: 1});
        // drawConnectors(canvasCtx, landmarks, [[9,8],[8,168]], {color: '#880000'}); //眉間
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0', lineWidth: 1});
      }
      // 目の上下のy座標の差が眉毛睫毛間のy座標の長さの1/7以下のサイズになったらつぶっていると判断
      if(Math.abs(landmarks[145]["y"] - landmarks[159]["y"])<Math.abs(landmarks[52]["y"]-landmarks[145]["y"])/close_val){
        eye_close.r = true;
      }else{
        eye_close.r = false;
      }
      if(Math.abs(landmarks[374]["y"] - landmarks[386]["y"])<Math.abs(landmarks[282]["y"]-landmarks[374]["y"])/close_val){
        eye_close.l = true;
      }else{
        eye_close.l = false;
      }
    }
  }
  eye_check(eye_close,dectation);
  canvasCtx.restore();
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true, // 虹彩の追加
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
// cam anmute
$cam.off.addEventListener("click",(e)=>{
    $cam.on.classList.remove("non-visi");
    $cam.off.classList.add("non-visi");
    camera.start();
    on_cam = true;
});
$cam.on.addEventListener("click",(e)=>{
    $cam.on.classList.add("non-visi");
    $cam.off.classList.remove("non-visi");
    camera.stop();
    on_cam = false;
});

const kirisute = (val,ii)=>{
    return Math.floor(val*(10**ii))/(10**ii);
};


// チェックボックス
document.getElementById("face_checke").addEventListener("change",e=>{
  show_face = e.target.checked;
});
document.getElementById("dec_checke").addEventListener("change",e=>{
  dec_eye = e.target.checked;
});

// キャンバス画面初期化
canvasCtx.fillStyle = "#529DF1";
canvasCtx.beginPath();
canvasCtx.rect(0, 0, canvasElement.width, canvasElement.height);
canvasCtx.fill();


const $eye = {"l":document.getElementById("left_eye_info"),"r":document.getElementById("right_eye_info")};
const adjustment_time = 1
const out_time = 5
let current_mode = "safe" // safe=>1秒連続で目閉じ=>care=>5秒70%以上目閉じ=>out  out=>5秒80%以上目開け=>safe
let left_eye = {"time":[],"flag":[]}
let right_eye = {"flag":[]}
const eye_check = (eye_obj,dectation)=>{
  var current_time = Date.now()/1000

  left_eye.flag.push(eye_obj.l);
  left_eye.time.push(current_time);
  right_eye.flag.push(eye_obj.r);

  if(current_mode == "safe"){
    left_eye.time = left_eye.time.filter(val =>Math.abs(val-current_time)<1);
    var fil_leng = left_eye.time.length
    left_eye.flag = left_eye.flag.splice(left_eye.flag.length-fil_leng,left_eye.flag.length)
    right_eye.flag = right_eye.flag.splice(right_eye.flag.length-fil_leng,right_eye.flag.length)
    var r_sum = right_eye.flag.reduce((sum, element) => sum + element, 0);
    var l_sum = left_eye.flag.reduce((sum, element) => sum + element, 0);
    // 1秒間目を閉じている
    console.log(l_sum/fil_leng,r_sum/fil_leng)
    if(r_sum == fil_leng && l_sum == fil_leng){
      current_mode == "care"
      left_eye = {"time":[],"flag":[]}
      right_eye = {"flag":[]}
    }
  }else if(current_mode == "care"){
    left_eye.time = left_eye.time.filter(val =>Math.abs(val-current_time)<5);
    var fil_leng = left_eye.time.length
    left_eye.flag = left_eye.flag.splice(left_eye.flag.length-fil_leng,left_eye.flag.length)
    right_eye.flag = right_eye.flag.splice(right_eye.flag.length-fil_leng,right_eye.flag.length)
    var r_sum = right_eye.flag.reduce((sum, element) => sum + element, 0);
    var l_sum = left_eye.flag.reduce((sum, element) => sum + element, 0);
    // 4.5秒以上データがたまっているかつそれぞれ８割以上目を閉じている
    if(left_eye.time[0] < current_time - 4.5 && r_sum/fil_leng > 0.7 && l_sum/fil_leng > 0.7){
      current_mode == "out"
    }
  }else if(current_mode == "out"){
    left_eye.time = left_eye.time.filter(val =>Math.abs(val-current_time)<5);
    var fil_leng = left_eye.time.length
    left_eye.flag = left_eye.flag.splice(left_eye.flag.length-fil_leng,left_eye.flag.length)
    right_eye.flag = right_eye.flag.splice(right_eye.flag.length-fil_leng,right_eye.flag.length)
    var r_sum = right_eye.flag.reduce((sum, element) => sum + element, 0);
    var l_sum = left_eye.flag.reduce((sum, element) => sum + element, 0);
    // 4.5秒以上データがたまっているかつそれぞれ2割以下目を閉じている
    if(left_eye.time[0] < current_time - 4.5 && r_sum/fil_leng < 0.2 && l_sum/fil_leng < 0.2){
      current_mode == "safe"
    }
  }
  if(dectation){
    if(eye_obj.r){
      $eye.r.innerText = "ー"
    }else{
      $eye.r.innerText = "●"
    }
    if(eye_obj.l){
      $eye.l.innerText = "ー"
    }else{
      $eye.l.innerText = "●"
    }
  }else{
    $eye.r.innerText = "x"
    $eye.l.innerText = "x"
    current_mode = "safe"
  }
}