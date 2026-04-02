function showAnnouncement() {
  hideAllPages();
  announcementPage = 1;
  var htmlContent = "<div class='news-wrapper'>";
  htmlContent += "<h2 class='news-title'>最新公告</h2>";
  htmlContent += "<div id='newsGrid' class='news-grid'>";
  htmlContent += "<div class='loading-container'><div class='loading-spinner'></div></div>";
  htmlContent += "</div>";
  htmlContent += "<div class='pagination-bar'>";
  htmlContent += "<button id='firstPageBtn' class='pagination-btn' onclick='goToFirstPage()'>首頁</button>";
  htmlContent += "<button id='prevPageBtn' class='pagination-btn' onclick='prevAnnouncementPage()'>上頁</button>";
  htmlContent += "<span id='pageInfo' class='pagination-info'></span>";
  htmlContent += "<button id='nextPageBtn' class='pagination-btn' onclick='nextAnnouncementPage()'>下頁</button>";
  htmlContent += "<button id='lastPageBtn' class='pagination-btn' onclick='goToLastPage()'>末頁</button>";
  htmlContent += "</div>";
  htmlContent += "<button onclick='hideAllPages();document.getElementById(\"dashboard\").style.display=\"block\";' class='return-btn'>返回首頁</button>";
  htmlContent += "</div>";
  document.getElementById("announcementPage").innerHTML = htmlContent;
  document.getElementById("announcementPage").style.display = "block";
  loadAnnouncements();
}

function loadAnnouncements() {
  google.script.run.withSuccessHandler(function (result) {
    var announcements = result.announcements;
    announcementTotalPages = Math.ceil(result.total / announcementPerPage);
    var html = "";
    if (announcements.length === 0) {
      html = "<p style='text-align: center; color: #ccc;'>本頁無公告</p>";
    } else {
      var now = new Date();
      var oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      announcements.forEach(function (ann, index) {
        var globalIndex = (announcementPage - 1) * announcementPerPage + index;
        var preview = ann.content.length > 50 ? ann.content.substring(0, 50) + "..." : ann.content;
        var annDate = new Date(ann.time);
        var isNew = annDate > oneWeekAgo;

        html += "<div class='news-item' style='animation-delay: " + (index * 0.1) + "s;' onclick='toggleNews(" + globalIndex + ")'>";
        if (isNew) {
          html += "<span class='news-new'>New</span>";
        }
        html += "<div class='news-date'>" + ann.time + "</div>";
        html += "<div class='news-tag'>" + ann.category + "</div>";
        html += "<div class='news-headline'>" + ann.title + "</div>";
        html += "<div class='news-author'>發布者: " + ann.publisher + "</div>";
        html += "<div class='news-teaser' id='teaser-" + globalIndex + "'>" + preview + "</div>";
        html += "<div class='news-full' id='full-" + globalIndex + "' style='display: none;'>" + ann.content + "</div>";
        html += "</div>";
      });
    }
    document.getElementById("newsGrid").innerHTML = html;
    updatePaginationControls();
  }).getAnnouncementsWithPagination(announcementPerPage, (announcementPage - 1) * announcementPerPage);
}

function toggleNews(index) {
  var teaser = document.getElementById("teaser-" + index);
  var full = document.getElementById("full-" + index);
  if (teaser && full) {
    var isExpanded = teaser.style.display === "none";
    teaser.style.display = isExpanded ? "block" : "none";
    full.style.display = isExpanded ? "none" : "block";
  }
}

function goToFirstPage() {
  if (announcementPage !== 1) {
    announcementPage = 1;
    loadAnnouncements();
  }
}

function prevAnnouncementPage() {
  if (announcementPage > 1) {
    announcementPage--;
    loadAnnouncements();
  }
}

function nextAnnouncementPage() {
  if (announcementPage < announcementTotalPages) {
    announcementPage++;
    loadAnnouncements();
  }
}

function goToLastPage() {
  if (announcementPage !== announcementTotalPages) {
    announcementPage = announcementTotalPages;
    loadAnnouncements();
  }
}

function updatePaginationControls() {
  document.getElementById("pageInfo").innerText = `第 ${announcementPage} 頁 / 共 ${announcementTotalPages} 頁`;
  document.getElementById("firstPageBtn").disabled = announcementPage === 1;
  document.getElementById("prevPageBtn").disabled = announcementPage === 1;
  document.getElementById("nextPageBtn").disabled = announcementPage === announcementTotalPages;
  document.getElementById("lastPageBtn").disabled = announcementPage === announcementTotalPages;
}