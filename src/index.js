//div by id
const canvasDiv = document.getElementById("canvasDiv");
const distDiv = document.getElementById("distDiv");
const distTypeDiv = document.getElementById("distTypeDiv");
const statusDiv = document.getElementById("statusDiv");
const volDiv = document.getElementById("volDiv");
const offsetDiv = document.getElementById("offsetDiv");
const offsetInputDiv = document.getElementById("offsetInputDiv");
const speakModeDiv = document.getElementById("speakModeDiv");
const imperialDiv = document.getElementById("imperialDiv");
const logsDiv = document.getElementById("logsDiv");
//const downloadBtn = document.getElementById("downloadBtn");

//running variables
var dists = [0];
var distsImperial = [0];
var cnts = [0];
var curVol = localStorage.getItem("volume");
if (curVol === null) curVol = 100;
else curVol = parseInt(curVol);
console.log("curVol", curVol);
var curOffset = localStorage.getItem("offset");
if (curOffset === null) curOffset = 0;
else curOffset = parseInt(curOffset);
console.log("curOffset", curOffset);
var curCoef = localStorage.getItem("coef");
if (curCoef === null) curCoef = 1;
else curCoef = parseInt(curCoef);
console.log("curCoef", curCoef);
var curSpeakMode = localStorage.getItem("speakMode");
if (curSpeakMode === null) curSpeakMode = 0;
else curSpeakMode = parseInt(curSpeakMode);
var curImperial = localStorage.getItem("imperial");
if (curImperial === null) curImperial = true;
else curImperial = curImperial === "true";
console.log("curImperial", curImperial);
var curReboot = 1;
console.log("curReboot", curReboot);
var lastValue = 1000;
// var noSpeak = false;
// var thresh = 3000;

//init display
volDiv.innerHTML = curVol;
offsetDiv.innerHTML = curOffset;
if (curSpeakMode == 0) speakModeDiv.innerHTML = "Threshold";
else if (curSpeakMode == 1) speakModeDiv.innerHTML = "Pitch";
else speakModeDiv.innerHTML = "Periodic";
imperialDiv.innerHTML = curImperial ? "Imperial" : "Metric";
distTypeDiv.innerHTML = curImperial ? "feet" : "meters";
var chart = new Chart(canvasDiv, {
  type: "line",
  data: {
    labels: cnts,
    datasets: [
      {
        label: "AGL Altitude (" + (curImperial ? "ft" : "m") + ")",
        data: curImperial ? distsImperial : dists,
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

function updateGraphDisplay(newDist) {
  dists.push(newDist);
  distsImperial.push(newDist * 3.28084);
  cnts.push(cnts[cnts.length - 1] + 1);
  if (cnts.length > 10) {
    dists.shift();
    distsImperial.shift();
    cnts.shift();
  }
  reGraph();
}
function reGraph() {
  chart.destroy();
  chart = new Chart(canvasDiv, {
    type: "line",
    data: {
      labels: cnts,
      datasets: [
        {
          label: "AGL Altitude (" + (curImperial ? "ft" : "m") + ")",
          data: curImperial ? distsImperial : dists,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

//set up BLE
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_DIST_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
// const CHAR_VOL_UUID = "66d04e60-89ba-4ab2-a0b3-2257bc8d43f7";
// const CHAR_OFFSET_UUID = "8c3b12cb-3445-4961-b9af-c49521dc9d7a";
const CHAR_REBOOT_UUID = "0d006e04-39d4-4d90-ae33-e278cbc6dc66";
let distChar;
// let volChar;
// let offsetChar;
let rebootChar;
let ble = new p5ble();

function bleStatusTrigger() {
  const x = ble.isConnected();
  statusDiv.innerHTML = x ? "Connected" : "Not Connected";
  statusDiv.className =
    "p-4 rounded-lg text-center " + (x ? "bg-green" : "bg-red");
  return x;
}
function connectBLE() {
  ble.connect(SERVICE_UUID, gotCharacteristics);
  bleStatusTrigger();
  curReboot = 1;
}
function disconnectBLE() {
  ble.disconnect();
  bleStatusTrigger();
  curReboot = 1;
}

//called once characteristics are received
function gotCharacteristics(error, characteristics) {
  if (bleStatusTrigger()) {
    if (error) console.log("error: ", error);
    uuids = [];
    for (let i = 0; i < characteristics.length; i++) {
      uuids[i] = characteristics[i].uuid.toLowerCase();
    }
    distChar = characteristics[uuids.indexOf(CHAR_DIST_UUID)];
    //volChar = characteristics[uuids.indexOf(CHAR_VOL_UUID)];
    //offsetChar = characteristics[uuids.indexOf(CHAR_OFFSET_UUID)];
    rebootChar = characteristics[uuids.indexOf(CHAR_REBOOT_UUID)];
    //trigger daisy chain
    ble.read(distChar, gotDist);
  }
}

//looped r/w
let cycleSize = 2;
let cycleTime = 1000;
let delay = cycleTime / cycleSize;
console.log("delay: " + delay);

function gotDist(error, value) {
  if (bleStatusTrigger()) {
    if (error) console.log("error: ", error);
    //get raw m
    console.log("Recv raw dist", value);
    value -= curOffset;
    value = Math.max(0, value) / 100;
    //upd graph
    updateGraphDisplay(value);
    //convert Imperial if necessary
    if (curImperial) value = mToFt(value);
    //upd disp
    distDiv.innerHTML = value.toFixed(2);
    //speak depending on mode
    if (curSpeakMode == 2) {
      //periodic
      synth(value.toPrecision(2), curVol);
    } else if (curSpeakMode == 1) {
      //pitch
    } else if (curSpeakMode == 0) {
      //threshold
      for (let i = 0; i < events.length; i++) {
        if (between(lastValue, events[i], value)) {
          synth("" + events[i], curVol);
          break;
        }
      }
    }

    setTimeout(() => {
      writeReboot();
    }, delay);
  }
}

function writeReboot() {
  if (bleStatusTrigger()) {
    ble.write(rebootChar, curReboot);
    setTimeout(() => {
      ble.read(distChar, gotDist);
    }, delay);
  }
}

// State modifying threads
function volUp() {
  curVol += 20;
  curVol = Math.min(curVol, 100);
  volDiv.innerHTML = curVol;
  localStorage.setItem("volume", "" + curVol);
}
function volDown() {
  curVol -= 20;
  curVol = Math.max(curVol, 0);
  volDiv.innerHTML = curVol;
  localStorage.setItem("volume", "" + curVol);
}
function setOffset() {
  curOffset = Number(offsetInputDiv.value);
  curOffset = Math.max(curOffset, 0);
  curOffset = Math.min(curOffset, 5000);
  offsetDiv.innerHTML = curOffset;
  localStorage.setItem("offset", "" + curOffset);
}
function changeSpeakMode() {
  curSpeakMode = (curSpeakMode + 1) % 3;
  if (curSpeakMode == 0) speakModeDiv.innerHTML = "Threshold";
  else if (curSpeakMode == 1) speakModeDiv.innerHTML = "Pitch";
  else speakModeDiv.innerHTML = "Periodic";
  localStorage.setItem("speakMode", "" + curSpeakMode);
}
function toggleImperial() {
  curImperial = !curImperial;
  imperialDiv.innerHTML = curImperial ? "Imperial" : "Metric";
  distTypeDiv.innerHTML = curImperial ? "feet" : "meters";
  localStorage.setItem("imperial", "" + curImperial);
  reGraph();
}
function reboot() {
  if (bleStatusTrigger()) {
    curReboot = 2;
  }
}

// !!! Make sure you can use speech synth!
if ("speechSynthesis" in window) {
  console.log(speechSynthesis.getVoices());
} else {
  alert("Sorry, your browser doesn't support text to speech!");
}

// Test audio
var mySound;
mySound = new Audio("0.wav");
function testAudio() {
  synth("Test", curVol);
  mySound.play();
}
