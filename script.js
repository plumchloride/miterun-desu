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
let comunicate = true;
let close_val = 0.01;

function onResults(results) {
  canvasCtx.save();
  canvasCtx.scale(-1, 1)
  canvasCtx.translate(-canvasElement.width, 0)
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if(show_face){canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)};
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      // landmarks {x,y,z} * 478
      // FACEMESH 1 to 2 に線を引くって言う意味
      // すべて表示
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,{color: '#C0C0C070', lineWidth: 0.5});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0', lineWidth: 1});
      // drawConnectors(canvasCtx, landmarks, [[9,8],[8,168]], {color: '#880000'}); //眉間
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
      if(Math.abs(landmarks[145]["y"] - landmarks[159]["y"])<close_val){
        console.log("r_eye_close")
      }
      if(Math.abs(landmarks[374]["y"] - landmarks[386]["y"])<close_val){
        console.log("l_eye_close")
      }
    }
  }
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