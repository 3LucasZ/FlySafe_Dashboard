const canvasDiv = document.getElementById("canvasDiv");
const speakerDiv = document.getElementById("speakerDiv");
var distDiv = document.getElementById("distDiv");
var statusDiv = document.getElementById("statusDiv");
var volDiv = document.getElementById("volDiv");
var dbg1Div = document.getElementById("dbg1Div");
var dbg2Div = document.getElementById("dbg2Div");
var dbg3Div = document.getElementById("dbg3Div");
var dists = [0];
var cnts = [0];
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
//set up
//set this to the service uuid of your device
const serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_DIST_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const CHAR_VOL_UUID = "66d04e60-89ba-4ab2-a0b3-2257bc8d43f7";
const CHAR_SPEAKER_UUID = "90788378-fca7-48da-9b30-a0bbfeacdb7b";
let distChar;
let volChar;
let speakerChar;
let ble = new p5ble();

function connectBLE() {
  ble.connect(serviceUuid, gotCharacteristics);
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
}
function disconnectBLE() {
  ble.disconnect();
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
}

// A function that will be called once characteristics are received
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
    speakerChar = characteristics[uuids.indexOf(CHAR_SPEAKER_UUID)];
    dbg1Div.innerHTML =
      "0: " + characteristics[0].uuid + " dist: " + distChar.uuid;
    dbg2Div.innerHTML =
      "1: " + characteristics[1].uuid + " vol: " + volChar.uuid;
    dbg3Div.innerHTML =
      "2: " + characteristics[2].uuid + " speaker: " + speakerChar.uuid;
    //start listening for notifications.
    //The callback handleNotifications will be called when a notification is received.
    ble.read(distChar, gotDist);
  }
}

function gotDist(error, value) {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  if (error) console.log("error: ", error);
  value /= 10;
  console.log("dist: ", value);
  distDiv.innerHTML = value;
  updateGraphDisplay(value);
  setTimeout(() => {
    ble.read(volChar, gotVol);
  }, 1000);
}
function gotVol(error, value) {
  statusDiv.innerHTML = "Connected: " + ble.isConnected();
  if (!ble.isConnected()) return;
  if (error) console.log("error: ", error);
  console.log("vol: ", value);
  volDiv.innerHTML = value;
  setTimeout(() => {
    ble.read(distChar, gotDist);
  }, 1000);
}

//writers
function writeSpeaker() {
  const speaker = speakerDiv.value;
  console.log("Write speaker: ", speaker);
  ble.write(speakerChar, speaker);
}
function volUp() {
  const vol = volDiv.innerHTML + 5;
  console.log("Write vol: ", vol);
  ble.write(volChar, vol);
}
function volDown() {
  const vol = volDiv.innerHTML - 5;
  console.log("Write vol: ", vol);
  ble.write(volChar, vol);
}
