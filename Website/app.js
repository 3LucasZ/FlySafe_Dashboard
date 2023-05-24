const canvasDiv = document.getElementById("canvasDiv");
const speakerDiv = document.getElementById("speakerDiv");
var distDiv = document.getElementById("distDiv");
var statusDiv = document.getElementById("statusDiv");

new Chart(canvasDiv, {
  type: "line",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
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

//set up
//set this to the service uuid of your device
const serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
// const CHAR_DIST_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
// const CHAR_VOL_UUID = "66d04e60-89ba-4ab2-a0b3-2257bc8d43f7";
// const CHAR_SPEAKER_UUID = "90788378-fca7-48da-9b30-a0bbfeacdb7b";
let distChar;
let volChar;
let speakerChar;
let ble = new p5ble();
let isConnected = false;

function connectBLE() {
  ble.connect(serviceUuid, gotCharacteristics);
}
function disconnectBLE() {
  ble.disconnect();
  isConnected = ble.isConnected();
  statusDiv.innerHTML = "Connected: " + isConnected;
}

// A function that will be called once characteristics are received
function gotCharacteristics(error, characteristics) {
  if (isConnected) {
  } else {
    isConnected = ble.isConnected();
    statusDiv.innerHTML = "Connected: " + isConnected;
    if (isConnected) {
      if (error) console.log("error: ", error);
      console.log("characteristics: ", characteristics);
      distChar = characteristics[2];
      volChar = characteristics[0];
      speakerChar = characteristics[1];
      //start listening for notifications.
      //The callback handleNotifications will be called when a notification is received.
      ble.read(distChar, gotDist);
    }
  }
}

function gotDist(error, value) {
  if (!isConnected) return;
  if (error) console.log("error: ", error);
  console.log("dist: ", value);
  distDiv.innerHTML = value;
  // After getting a value, call p5ble.read() again to get the value again
  setTimeout(() => {
    ble.read(distChar, gotDist);
  }, 1000);
}

//writers
function writeSpeaker() {
  const speaker = speakerDiv.value;
  console.log("Write Speaker: ", speaker);
  ble.write(speakerChar, speaker);
}
