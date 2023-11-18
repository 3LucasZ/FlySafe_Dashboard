# FlySafe

!!! BLE edited to fix -ble write- issue
key: "write",
value: function write(characteristic, inputValue) {
if (!characteristic || !characteristic.uuid)
console.error("The characteristic does not exist.");
var validChar = this.characteristics.find(function (char) {
return char.uuid === characteristic.uuid;
});
if (!validChar)
return console.error("The characteristic does not exist.");
//EDIT THIS FUNCTION WHICH IS FAULTY
let encoder = new TextEncoder("utf-8");
//var bufferToSend = Uint8Array.of(inputValue);
var bufferToSend = encoder.encode(inputValue);
console.log(
"Writing ",
bufferToSend,
" to Characteristic..."
);
return characteristic.writeValue(bufferToSend);
},

!!! custom partitition scheme to fit lib + sound

# Tools

- Online Tone Generator: https://www.szynalski.com/tone-generator/
- - https://marcgg.com/blog/2016/11/01/javascript-audio/
- Bluefi Browser
- P5 Ble JS
- Platform IO
- Tailwind CSS
- Speech Synthesis API
- Local session storage
- - Limit: 5MB and only strings, which is about 5x10^6 characters.
- - Save on window close: unreliable, so j do it every 10 seconds?

# Choices

- Synth >> wav
- Plain HTML >> react
- BLE >> Wifi
- Local storage >> runtime storage

# Misc

- How to do BLE Periphery Simulation?
