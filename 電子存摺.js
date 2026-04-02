
// 分頁變數：電子存摺
var passbookPage = 1;
var passbookPerPage = 10;
var passbookTotalPages = 1;
function showPassbook() {
  hideAllPages();
  passbookPage = 1;
  var name = document.getElementById("userName").innerText;
  var passNameElem = document.getElementById("passbookUserName");
  if (passNameElem) passNameElem.innerText = name;
  document.getElementById("passbookPage").style.display = "block";
  document.getElementById("passbookTable").innerHTML = "<p class='text-center'>載入中...</p>";
  loadPassbook();
}

function loadPassbook() {
  var name = document.getElementById("userName").innerText;
  google.script.run.withSuccessHandler(function (result) {
    var htmlContent = result.html;
    passbookTotalPages = Math.ceil(result.total / passbookPerPage);
    var paginationHtml = "<div class='passbook-pagination'>";
    if (passbookPage > 1) {
      paginationHtml += "<button onclick='prevPassbook()' class='passbook-page-btn mr-2'>上一頁</button>";
    }
    paginationHtml += "第 " + passbookPage + " 頁，共 " + passbookTotalPages + " 頁";
    if (passbookPage < passbookTotalPages) {
      paginationHtml += "<button onclick='nextPassbook()' class='passbook-page-btn ml-2'>下一頁</button>";
    }
    paginationHtml += "</div>";
    document.getElementById("passbookTable").innerHTML = htmlContent + paginationHtml;
  }).getPassbookRecords(currentAccount, name, passbookPerPage, (passbookPage - 1) * passbookPerPage);
}

function changePassbookPerPage() {
  passbookPerPage = parseInt(document.getElementById("passbookPerPageSelect").value);
  passbookPage = 1;
  loadPassbook();
}

function prevPassbook() {
  if (passbookPage > 1) {
    passbookPage--;
    loadPassbook();
  }
}

function nextPassbook() {
  if (passbookPage < passbookTotalPages) {
    passbookPage++;
    loadPassbook();
  }
}

function backToDashboardFromPassbook() {
  hideAllPages();
  document.getElementById("dashboard").style.display = "block";
}