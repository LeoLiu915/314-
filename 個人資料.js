function showPersonalData() {
  hideAllPages();
  document.getElementById("personalDataPage").style.display = "block";
  document.getElementById("personalDataContainer").innerHTML = "<p class='text-center'>載入中...</p>";
  loadPersonalData();
}

function loadPersonalData() {
  google.script.run.withSuccessHandler(function (html) {
    document.getElementById("personalDataContainer").innerHTML = html;
  }).getPersonalData(currentAccount);
}