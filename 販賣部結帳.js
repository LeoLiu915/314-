function loadCategories() {
  google.script.run.withSuccessHandler(function (categories) {
    var cfCategory = document.getElementById('cfCategory_0');
    cfCategory.innerHTML = '';
    var defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "請選擇類別";
    cfCategory.appendChild(defaultOption);
    categories.forEach(function (cat) {
      var option = document.createElement('option');
      option.value = cat;
      option.text = cat;
      cfCategory.appendChild(option);
    });
    document.getElementById('cfItemContainer_0').style.display = 'none';
    document.getElementById('cfCustomItemContainer_0').style.display = 'none';
    document.getElementById('cfPrice_0').value = '0';
  }).getCategories();
}

// 2. 當商品類別改變時
function onCategoryChange(index) {
  var category = document.getElementById('cfCategory_' + index).value;
  var itemContainer = document.getElementById('cfItemContainer_' + index);
  var customItemContainer = document.getElementById('cfCustomItemContainer_' + index);
  if (category === "其他") {
    itemContainer.style.display = 'none';
    customItemContainer.style.display = 'block';
    document.getElementById('cfPrice_' + index).value = '';
    document.getElementById('cfPrice_' + index).readOnly = false;
  } else {
    itemContainer.style.display = 'block';
    customItemContainer.style.display = 'none';
    google.script.run.withSuccessHandler(function (items) {
      var cfItem = document.getElementById('cfItem_' + index);
      cfItem.innerHTML = '';
      items.forEach(function (item) {
        var option = document.createElement('option');
        option.value = item.name;
        option.setAttribute('data-price', item.price);
        option.text = item.name;
        cfItem.appendChild(option);
      });
      onItemChange(index);
    }).getItemsForCategory(category);
  }
}

// 3. 當商品項目改變時（僅用於非其他情形）
function onItemChange(index) {
  var cfItem = document.getElementById('cfItem_' + index);
  var selectedOption = cfItem.options[cfItem.selectedIndex];
  var price = selectedOption ? parseFloat(selectedOption.getAttribute('data-price')) : 0;
  var quantity = parseInt(document.getElementById('cfQuantity_' + index).value) || 1;
  document.getElementById('cfPrice_' + index).value = (price * quantity).toFixed(2);
  document.getElementById('cfPrice_' + index).readOnly = true;
}

// 4. 使用者點擊「確認結帳」時，收集資料並送往後端執行交易
async function initiateCashierCheckout() {
  var items = [];
  for (let i = 0; i <= itemCount; i++) {
    var category = document.getElementById('cfCategory_' + i)?.value;
    if (!category || category === "") continue;
    var item, price, quantity;
    if (category === "其他") {
      item = document.getElementById('cfCustomItem_' + i)?.value;
      price = Number(document.getElementById('cfPrice_' + i)?.value) || 0;
      quantity = parseInt(document.getElementById('cfQuantity_' + i)?.value) || 1;
      if (!item) {
        document.getElementById('cfError').innerText = "請輸入商品名稱";
        document.getElementById('cfError').style.display = "block";
        return;
      }
    } else {
      item = document.getElementById('cfItem_' + i)?.value;
      price = Number(document.getElementById('cfPrice_' + i)?.value) || 0;
      quantity = parseInt(document.getElementById('cfQuantity_' + i)?.value) || 1;
      if (!item) continue;
    }
    if (!price || price <= 0) {
      document.getElementById('cfError').innerText = "金額無效";
      document.getElementById('cfError').style.display = "block";
      return;
    }
    items.push({ category, item, price, quantity });
  }
  if (!items.length) {
    document.getElementById('cfError').innerText = "請至少選擇一項商品";
    document.getElementById('cfError').style.display = "block";
    return;
  }

  var usePoints = document.getElementById('use-points').checked ?
    Number(document.getElementById('discount-input').value) * 300 : 0;
  document.getElementById('cashierProcessingModal').style.display = 'flex';
  var confirmButton = document.querySelector('#cashierForm button[onclick="initiateCashierCheckout()"]');
  confirmButton.disabled = true;
  var ip = await getUserIP();

  google.script.run.withSuccessHandler(function (result) {
    document.getElementById('cashierProcessingModal').style.display = 'none';
    if (result.success) {
      document.getElementById('cashierSuccessModal').style.display = 'flex';
    } else {
      document.getElementById('cfError').innerText = result.error;
      document.getElementById('cfError').style.display = "block";
      confirmButton.disabled = false;
    }
  }).withFailureHandler(function (error) {
    document.getElementById('cashierProcessingModal').style.display = 'none';
    document.getElementById('cfError').innerText = "結帳時發生錯誤，請稍後再試";
    document.getElementById('cfError').style.display = "block";
    confirmButton.disabled = false;
  }).cashierCheckout(currentAccount, items, usePoints, ip);
}

// 5. 關閉結帳成功模態視窗並返回首頁
function closeCashierSuccessModal() {
  document.getElementById('cashierSuccessModal').style.display = 'none';
  hideAllPages();
  document.getElementById('dashboard').style.display = 'block';
  itemCount = 0;
  document.getElementById('additionalItemsContainer').innerHTML = '';
  showCashierForm();
  document.querySelector('#cashierForm button[onclick="initiateCashierCheckout()"]').disabled = false;
}

// 6. 顯示結帳系統頁面時載入類別選項並初始化點數
function showCashierForm() {
  hideAllPages();
  document.getElementById("cashierForm").style.display = "block";
  itemCount = 0;
  document.getElementById('additionalItemsContainer').innerHTML = '';
  document.getElementById('cfCategory_0').selectedIndex = 0;
  document.getElementById('cfItemContainer_0').style.display = 'none';
  document.getElementById('cfCustomItemContainer_0').style.display = 'none';
  document.getElementById('cfCustomItem_0').value = '';
  document.getElementById('cfQuantity_0').value = '1';
  document.getElementById('cfPrice_0').value = '0';
  document.getElementById('cfError').innerText = '';
  document.getElementById('cfError').style.display = 'none';
  document.getElementById('use-points').checked = false;
  document.getElementById('discount-input').value = '';
  document.getElementById('discount-input').disabled = true;
  document.querySelector('#cashierForm button[onclick="initiateCashierCheckout()"]').disabled = false;
  loadCategories();
  // 載入點數資訊
  google.script.run.withSuccessHandler(function (data) {
    document.getElementById('points-display').innerHTML =
      `您的數資points：${data.points} / ${data.ntValue}元 <span onclick="showPointsExplanation()" class="cursor-pointer text-blue-500">?</span>`;
    document.getElementById('expiring-points').innerHTML =
      `本週（7天內）即將到期 ${data.expiringPoints} 點 (${data.expiringNT}元)`;
  }).getUserPoints(currentAccount);
}

// 7. 更新價格（根據數量變動）
function updatePrice(index) {
  var category = document.getElementById('cfCategory_' + index).value;
  var quantity = parseInt(document.getElementById('cfQuantity_' + index).value) || 1;
  if (quantity < 1) {
    document.getElementById('cfQuantity_' + index).value = 1;
    quantity = 1;
  }
  if (category === "其他") {
    var customPrice = parseFloat(document.getElementById('cfPrice_' + index).value) || 0;
    document.getElementById('cfPrice_' + index).value = (customPrice * quantity).toFixed(2);
  } else {
    onItemChange(index);
  }
}

// 8. 新增一項商品
function addNewItem() {
  if (itemCount >= 4) {
    document.getElementById('addItemBtn').style.display = "none";
    return;
  }
  itemCount++;
  var container = document.getElementById("additionalItemsContainer");
  var html = "<div id='item_" + itemCount + "' class='mt-[3.5%]'>";
  html += "<h3 class='text-[100%] font-semibold mb-2'>商品項目 " + (itemCount + 1) + "</h3>";
  html += "<div class='mt-[1.5%]'>";
  html += "<label class='block text-gray-600 text-[80%] font-medium'>商品類別</label>";
  html += "<select id='cfCategory_" + itemCount + "' class='w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none' onchange='onCategoryChange(" + itemCount + ")'>";
  html += "</select></div>";
  html += "<div id='cfItemContainer_" + itemCount + "' class='mt-[2.5%]' style='display:none;'>";
  html += "<label class='block text-gray-600 text-sm font-medium'>商品項目</label>";
  html += "<select id='cfItem_" + itemCount + "' class='w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none' onchange='onItemChange(" + itemCount + ")'>";
  html += "</select></div>";
  html += "<div id='cfCustomItemContainer_" + itemCount + "' class='mt-4' style='display:none;'>";
  html += "<label class='block text-gray-600 text-[80%] font-medium'>請輸入商品名稱</label>";
  html += "<input type='text' id='cfCustomItem_" + itemCount + "' class='w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none' value='' />";
  html += "</div>";
  html += "<div class='mt-[2.5%]'>";
  html += "<label class='block text-gray-600 text-[80%] font-medium'>購買數量</label>";
  html += "<input type='number' id='cfQuantity_" + itemCount + "' class='w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none' value='1' min='1' onchange='updatePrice(" + itemCount + ")' />";
  html += "</div>";
  html += "<div class='mt-[2.5%]'>";
  html += "<label class='block text-gray-600 text-[80%] font-medium'>金額</label>";
  html += "<input type='number' id='cfPrice_" + itemCount + "' class='w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none' readonly value='0' />";
  html += "</div>";
  html += "</div>";
  container.innerHTML += html;
  loadCategoriesForItem(itemCount);
}

// 9. 為新項目載入類別
function loadCategoriesForItem(index) {
  google.script.run.withSuccessHandler(function (categories) {
    var cfCategory = document.getElementById('cfCategory_' + index);
    cfCategory.innerHTML = '';
    var defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.text = "請選擇類別";
    cfCategory.appendChild(defaultOption);
    categories.forEach(function (cat) {
      var option = document.createElement('option');
      option.value = cat;
      option.text = cat;
      cfCategory.appendChild(option);
    });
    document.getElementById('cfItemContainer_' + index).style.display = 'none';
    document.getElementById('cfCustomItemContainer_' + index).style.display = 'none';
    document.getElementById('cfPrice_' + index).value = '0';
  }).getCategories();
}

// 10. 點數相關功能
function toggleDiscountInput() {
  document.getElementById('discount-input').disabled = !document.getElementById('use-points').checked;
}

function showPointsExplanation() {
  document.getElementById('points-explanation').style.display = 'flex';
}

function hidePointsExplanation() {
  document.getElementById('points-explanation').style.display = 'none';
}

// 11. 獲取使用者 IP
async function getUserIP() {
  try {
    let response = await fetch("https://api64.ipify.org?format=json");
    let data = await response.json();
    return data.ip;
  } catch {
    return "未知";
  }
}