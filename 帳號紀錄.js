// 分頁變數：帳號紀錄
var accountRecordsPage = 1;
var accountRecordsPerPage = 10;
var accountRecordsTotalPages = 1;
function showAccountRecords() {
  hideAllPages();
  accountRecordsPage = 1;
  var name = document.getElementById("userName").innerText;
  var nameSpan = document.getElementById("accountRecordsUserName");
  if (nameSpan) nameSpan.innerText = name;
  document.getElementById("accountRecordsPage").style.display = "block";
  document.getElementById("recordsData").innerHTML = "<p class='text-center'>載入中...</p>";
  loadAccountRecords();
}

function loadAccountRecords() {
  google.script.run.withSuccessHandler(function (result) {
    var htmlContent = result.html;
    accountRecordsTotalPages = Math.ceil(result.total / accountRecordsPerPage);
    var paginationHtml = "<div class='account-records-pagination'>";
    if (accountRecordsPage > 1) {
      paginationHtml += "<button onclick='prevAccountRecords()' class='account-records-page-btn mr-2'>上一頁</button>";
    }
    paginationHtml += "第 " + accountRecordsPage + " 頁，共 " + accountRecordsTotalPages + " 頁";
    if (accountRecordsPage < accountRecordsTotalPages) {
      paginationHtml += "<button onclick='nextAccountRecords()' class='account-records-page-btn ml-2'>下一頁</button>";
    }
    paginationHtml += "</div>";
    document.getElementById("recordsData").innerHTML = htmlContent + paginationHtml;
  }).getAccountRecords(currentAccount, accountRecordsPerPage, (accountRecordsPage - 1) * accountRecordsPerPage);
}

function changeAccountRecordsPerPage() {
  accountRecordsPerPage = parseInt(document.getElementById("accountRecordsPerPageSelect").value);
  accountRecordsPage = 1;
  loadAccountRecords();
}

function prevAccountRecords() {
  if (accountRecordsPage > 1) {
    accountRecordsPage--;
    loadAccountRecords();
  }
}

function nextAccountRecords() {
  if (accountRecordsPage < accountRecordsTotalPages) {
    accountRecordsPage++;
    loadAccountRecords();
  }
}