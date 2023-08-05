//BROKEN RIGHT NOW
function gotVol(error, value) {
  if (bleStatusTrigger()) {
    if (error) console.log("error: ", error);
    console.log("vol: ", value);
    volDiv.innerHTML = value;
    curVol = value;
    setTimeout(() => {
      ble.read(offsetChar, gotOffset);
    }, delay);
  }
}
function gotOffset(error, value) {
  if (bleStatusTrigger()) {
    if (error) console.log("error: ", error);
    console.log("offset: ", value);
    offsetDiv.innerHTML = value;
    curOffset = Number(value);
    setTimeout(() => {
      ble.read(distChar, gotDist);
    }, delay);
  }
}
function writeVol() {
  if (bleStatusTrigger()) {
    ble.write(volChar, curVol);
    console.log("Write vol: ", curVol);
    setTimeout(() => {
      writeOffset();
    }, delay);
  }
}
function writeOffset() {
  if (bleStatusTrigger()) {
    ble.write(offsetChar, curOffset);
    console.log("Write offset: ", curOffset);
    setTimeout(() => {
      writeReboot();
    }, delay);
  }
}
