function showClassFeeRequestForm() {
  hideAllPages();
  document.getElementById("cfRequestReason").value = "";
  document.getElementById("cfRequestAmount").value = "";
  document.getElementById("cfRequestError").style.display = "none";
  document.getElementById("classFeeRequestPage").style.display = "block";
  bindEnterKey('classFeeRequestPage', ['cfRequestReason', 'cfRequestAmount']);
}

function submitClassFeeRequestForm() {
  var reason = document.getElementById("cfRequestReason").value.trim();
  var amountStr = document.getElementById("cfRequestAmount").value.trim();
  var errorBox = document.getElementById("cfRequestError");
  errorBox.style.display = "none";
  errorBox.innerText = "";
  if (!reason || !amountStr) {
    errorBox.innerText = "所有欄位均為必填！";
    errorBox.style.display = "block";
    return;
  }
  var amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    errorBox.innerText = "請款金額必須為正數！";
    errorBox.style.display = "block";
    return;
  }
  google.script.run.withSuccessHandler(function (result) {
    if (result.success) {
      alert("請款申請已送出！");
      hideAllPages();
      document.getElementById("dashboard").style.display = "block";
    } else {
      errorBox.innerText = result.error;
      errorBox.style.display = "block";
    }
  }).submitClassFeeRequest(currentAccount, reason, amount);
}
