//div by id
const canvasDiv = document.getElementById("canvasDiv");
const distDiv = document.getElementById("distDiv");
const statusDiv = document.getElementById("statusDiv");
const volDiv = document.getElementById("volDiv");
const offsetDiv = document.getElementById("offsetDiv");
const offsetInputDiv = document.getElementById("offsetInputDiv");

//running variables
var dists = [0];
var cnts = [0];
var curVol;
var curOffset;
var curReboot = 1;

//chart
var chart = new Chart(canvasDiv, {
  type: "line",
  data: {
    labels: cnts,
    datasets: [
      {
        label: "AGL Altitude (m)",
        data: dists,
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

function updateGraphDisplay(newDist) {
  dists.push(newDist);
  cnts.push(cnts[cnts.length - 1] + 1);
  if (cnts.length > 10) {
    dists.shift();
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
          label: "AGL Altitude (m)",
          data: dists,
          borderWidth: 1,
        },
      ],
    },
    options: {
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
const serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_DIST_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const CHAR_VOL_UUID = "66d04e60-89ba-4ab2-a0b3-2257bc8d43f7";
const CHAR_OFFSET_UUID = "8c3b12cb-3445-4961-b9af-c49521dc9d7a";
const CHAR_REBOOT_UUID = "0d006e04-39d4-4d90-ae33-e278cbc6dc66";
let distChar;
let volChar;
let speakerChar;
let offsetChar;
let rebootChar;
let ble = new p5ble();

function connectBLE() {
  ble.connect(serviceUuid, gotCharacteristics);
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  curReboot = 1;
}
function disconnectBLE() {
  ble.disconnect();
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  curReboot = 1;
}

//called once characteristics are received
function gotCharacteristics(error, characteristics) {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (ble.isConnected()) {
    if (error) console.log("error: ", error);
    uuids = [];
    for (let i = 0; i < characteristics.length; i++) {
      uuids[i] = characteristics[i].uuid.toLowerCase();
    }
    distChar = characteristics[uuids.indexOf(CHAR_DIST_UUID)];
    volChar = characteristics[uuids.indexOf(CHAR_VOL_UUID)];
    offsetChar = characteristics[uuids.indexOf(CHAR_OFFSET_UUID)];
    rebootChar = characteristics[uuids.indexOf(CHAR_REBOOT_UUID)];
    ble.read(volChar, gotVol);
  }
}

//init r/w
function gotVol(error, value) {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  if (error) console.log("error: ", error);
  console.log("vol: ", value);
  volDiv.innerHTML = value;
  curVol = value;
  setTimeout(() => {
    ble.read(offsetChar, gotOffset);
  }, 50);
}
function gotOffset(error, value) {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  if (error) console.log("error: ", error);
  console.log("offset: ", value);
  offsetDiv.innerHTML = value;
  curOffset = Number(value);
  setTimeout(() => {
    ble.read(distChar, gotDist);
  }, 50);
}

//looped r/w
function gotDist(error, value) {
  //display dist
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  if (error) console.log("error: ", error);
  console.log("Recv raw dist", value);
  value -= curOffset;
  value = Math.max(0, value);
  distDiv.innerHTML = value / 100;
  updateGraphDisplay(value / 100);

  //speak dist with 2 precision
  window.speechSynthesis.cancel(); // !!! clear q
  var msg = new SpeechSynthesisUtterance();
  if (value > 100) {
    value = 10 * Math.round(value / 10);
  }
  if (value > 1000) {
    value = 100 * Math.round(value / 100);
  }
  msg.text = "" + value / 100;
  window.speechSynthesis.speak(msg);
  setTimeout(() => {
    writeVol();
  }, 400);
}

function writeVol() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  ble.write(volChar, curVol);
  console.log("Write vol: ", curVol);
  setTimeout(() => {
    writeOffset();
  }, 400);
}
function writeOffset() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  ble.write(offsetChar, curOffset);
  console.log("Write offset: ", curOffset);
  setTimeout(() => {
    writeReboot();
  }, 400);
}
function writeReboot() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  ble.write(rebootChar, curReboot);
  setTimeout(() => {
    ble.read(distChar, gotDist);
  }, 400);
}

//state changers
function volUp() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  curVol += 5;
  curVol = Math.min(curVol, 100);
  volDiv.innerHTML = curVol;
}
function volDown() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  curVol -= 5;
  curVol = Math.max(curVol, 0);
  volDiv.innerHTML = curVol;
}
function setOffset() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  curOffset = Number(offsetInputDiv.value);
  curOffset = Math.max(curOffset, 0);
  curOffset = Math.min(curOffset, 5000);
  offsetDiv.innerHTML = curOffset;
}
function reboot() {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  curReboot = 2;
}

if ("speechSynthesis" in window) {
  console.log(speechSynthesis.getVoices());
} else {
  alert("Sorry, your browser doesn't support text to speech!");
}

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
