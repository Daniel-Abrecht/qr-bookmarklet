import QrScanner from "./qr-scanner/qr-scanner.min.js";
QrScanner.WORKER_PATH = './qr-scanner/qr-scanner-worker.min.js';

const flashToggle = document.getElementById('flash-toggle');
const previewCanvas = document.getElementById('preview-canvas');

let scanner;

if(window.opener){
  init();
}else{
  document.body.classList.add("noinc");
}

let last_result = null;
function setResult(result){
  if(last_result == result)
    return;
  last_result = result;
  window.opener.postMessage({ type: "qr-code", detail: result }, "*");
  window.close();
}

function updateFlashState(){
  flashToggle.value = "📸 Flash: " + (scanner.isFlashOn() ? 'on' : 'off');
  scanner.hasFlash().then(hasFlash=>flashToggle.style.display=hasFlash?'block':'none');
}

async function start(){
  try {
    await scanner.start();
    previewCanvas.innerHTML='';
    previewCanvas.appendChild(scanner.$canvas);
    document.body.classList.add("ready");
    addEventListener("focus", ()=>scanner.start());
  } catch(e) {
    document.body.classList.add("error");
    throw e;
  }
}

async function init(){
  try {
    scanner = new QrScanner(document.createElement('video'), result=>setResult(result));
    QrScanner.hasCamera().then(hasCamera=>document.body.dataset.hasCamera=hasCamera);
    updateFlashState();
    flashToggle.addEventListener('click', async()=>{
      await scanner.toggleFlash();
      updateFlashState();
    });
    await start();
  } catch(e) {
    document.body.classList.add("error");
    document.querySelector("#errors span").innerText = e.message || e;
    throw e;
  } finally {
    updateFlashState();
  }
}
