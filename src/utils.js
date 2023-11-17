function mToFt(x) {
  return x * 3.28084;
}

function getSeconds() {
  var d = new Date();
  return (d.getTime() - d.setHours(0, 0, 0)) / 1000;
}

function between(l, x, r) {
  return (l <= x && x <= r) || (r <= x && x <= l);
}

function synth(str, vol) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = str;
  msg.volume = vol / 100;
  window.speechSynthesis.cancel(); // !!! clear q
  window.speechSynthesis.speak(msg);
}
