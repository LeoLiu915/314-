// 分頁變數：班費查詢
var classFeePage = 1;
var classFeePerPage = 10;
var classFeeTotalPages = 1;
function showClassFeeQuery() {
  hideAllPages();
  classFeePage = 1;
  document.getElementById("classFeeQueryPage").style.display = "block";
  document.getElementById("classFeeTable").innerHTML = "<p class='text-center'>載入中...</p>";
  loadClassFeeRecords();
}

function loadClassFeeRecords() {
  google.script.run.withSuccessHandler(function (result) {
    var htmlContent = result.html;
    classFeeTotalPages = Math.ceil(result.total / classFeePerPage);
    var paginationHtml = "<div class='class-fee-pagination'>";
    if (classFeePage > 1) {
      paginationHtml += "<button onclick='prevClassFee()' class='class-fee-page-btn mr-2'>上一頁</button>";
    }
    paginationHtml += "第 " + classFeePage + " 頁，共 " + classFeeTotalPages + " 頁";
    if (classFeePage < classFeeTotalPages) {
      paginationHtml += "<button onclick='nextClassFee()' class='class-fee-page-btn ml-2'>下一頁</button>";
    }
    paginationHtml += "</div>";
    document.getElementById("classFeeTable").innerHTML = htmlContent + paginationHtml;
  }).getClassFeeRecords(classFeePerPage, (classFeePage - 1) * classFeePerPage);
}

function changeClassFeePerPage() {
  classFeePerPage = parseInt(document.getElementById("classFeePerPageSelect").value);
  classFeePage = 1;
  loadClassFeeRecords();
}

function prevClassFee() {
  if (classFeePage > 1) {
    classFeePage--;
    loadClassFeeRecords();
  }
}

function nextClassFee() {
  if (classFeePage < classFeeTotalPages) {
    classFeePage++;
    loadClassFeeRecords();
  }
}

function backToDashboardFromClassFee() {
  hideAllPages();
  document.getElementById("dashboard").style.display = "block";
}