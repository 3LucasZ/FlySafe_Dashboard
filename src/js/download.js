function downloadFlightData() {
  var content = "hello world";
  download(content);
}
function download(content) {
  var file = new File(["\ufeff" + content], "hello.txt", {
    type: "text/plain:charset=UTF-8",
  });
  url = window.URL.createObjectURL(file);
  console.log(file);
  console.log(url);

  //a.style = "display: none";
  secretDiv.href = url;
  logsDiv.innerHTML = url + " | " + content + " | " + file.webkitRelativePath;
  //secretDiv.download = file.name;
  //a.click();
  //window.URL.revokeObjectURL(url);
}
function abc() {
  // var newWindow = window.open();
  // newWindow.document.write("ohai");
  // var html = "<html><head></head><body>ohai</body></html>";
  // var uri = "data:text/html," + encodeURIComponent(html);
  // var newWindow = window.open(uri);
  //window.open("OHAI");
}
