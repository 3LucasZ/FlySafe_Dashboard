function downloadFlightData() {
  var content = "hello world";
  var file = new File(["\ufeff" + content], "myFile.txt", {
    type: "text/plain:charset=UTF-8",
  });
  url = window.URL.createObjectURL(file);
  var a = document.createElement("a");
  a.style = "display: none";
  a.href = url;
  a.download = file.name;
  a.click();
  window.URL.revokeObjectURL(url);
}
