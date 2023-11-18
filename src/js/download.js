function downloadFlightData() {
  var content = "hello world";
  download(content);
}
function download(content) {
  var file = new File(["\ufeff" + content], "myFile.txt", {
    type: "text/plain:charset=UTF-8",
  });
  url = window.URL.createObjectURL(file);
  console.log(file);
  console.log(url);

  //a.style = "display: none";
  secretDiv.href = url;
  logsDiv.innerHTML = url + "HEY THERE" + content;
  //secretDiv.download = file.name;
  //a.click();
  //window.URL.revokeObjectURL(url);
}
