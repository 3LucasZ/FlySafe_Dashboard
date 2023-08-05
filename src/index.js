//div by id
const canvasDiv = document.getElementById("canvasDiv");
const distDiv = document.getElementById("distDiv");
const distTypeDiv = document.getElementById("distTypeDiv");
const statusDiv = document.getElementById("statusDiv");
const volDiv = document.getElementById("volDiv");
const offsetDiv = document.getElementById("offsetDiv");
const offsetInputDiv = document.getElementById("offsetInputDiv");
const imperialDiv = document.getElementById("imperialDiv");
const logsDiv = document.getElementById("logsDiv");

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
var curImperial = localStorage.getItem("imperial");
if (curImperial === null) curImperial = true;
else curImperial = curImperial === "true";
console.log("curImperial", curImperial);
var curReboot = 1;
console.log("curReboot", curReboot);
var curSpeak = 0;
// var noSpeak = false;
// var thresh = 3000;

//init display
volDiv.innerHTML = curVol;
offsetDiv.innerHTML = curOffset;
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
const CHAR_VOL_UUID = "66d04e60-89ba-4ab2-a0b3-2257bc8d43f7";
const CHAR_OFFSET_UUID = "8c3b12cb-3445-4961-b9af-c49521dc9d7a";
const CHAR_REBOOT_UUID = "0d006e04-39d4-4d90-ae33-e278cbc6dc66";
let distChar;
let volChar;
let offsetChar;
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
    volChar = characteristics[uuids.indexOf(CHAR_VOL_UUID)];
    offsetChar = characteristics[uuids.indexOf(CHAR_OFFSET_UUID)];
    rebootChar = characteristics[uuids.indexOf(CHAR_REBOOT_UUID)];
    //trigger daisy chain
    ble.read(distChar, gotDist);
    sayDistance();
  }
}

//looped r/w
let cycleSize = 2;
let cycleTime = 50;
let delay = cycleTime / cycleSize;
console.log("delay: " + delay);

function gotDist(error, value) {
  if (bleStatusTrigger()) {
    if (error) console.log("error: ", error);

    // gen dist
    console.log("Recv raw dist", value);
    value -= curOffset;
    value = Math.max(0, value);
    updateGraphDisplay(value / 100);
    if (curImperial) {
      value *= 0.0328084; // cm to ft
      value *= 100; // put it in "centifeet"
      value = Math.round(value);
    }
    distDiv.innerHTML = value / 100;

    //speak dist with precision: 2
    if (value > 100) value = 10 * Math.round(value / 10);
    if (value > 1000) value = 100 * Math.round(value / 100);
    curSpeak = "" + value / 100;
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

function sayDistance() {
  if (bleStatusTrigger()) {
    var msg = new SpeechSynthesisUtterance();
    msg.text = curSpeak;
    msg.volume = curVol / 100;
    msg.onend = (event) => {
      setTimeout(() => {
        sayDistance();
      }, 100);
    };
    msg.onerror = (event) => {
      setTimeout(() => {
        sayDistance();
      }, 100);
    };
    //window.speechSynthesis.cancel(); // !!! clear q
    window.speechSynthesis.speak(msg);
    console.log("speak now");
    logsDiv.innerHTML = Math.random();
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
function testAudio() {
  var msg = new SpeechSynthesisUtterance();
  msg.text = "Test";
  window.speechSynthesis.speak(msg);
  //console.log(speechSynthesis.getVoices());
}
var mySound;
mySound = new Audio("0.wav");
function test2Audio() {
  mySound.play();
}
