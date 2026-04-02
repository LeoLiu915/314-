function showPersonalNotifications() {
  hideAllPages();
  document.getElementById("notificationList").innerHTML = "<div class='loading-container'><div class='loading-spinner'></div></div>";
  document.getElementById("personalNotificationsPage").style.display = "block";
  loadPersonalNotifications();
}

function loadPersonalNotifications() {
  console.log("Loading notifications for account:", currentAccount);
  google.script.run
    .withSuccessHandler(function (result) {
      console.log("Received result:", result);
      var notifications = result && result.notifications ? result.notifications : [];
      var html = "";
      if (notifications.length === 0) {
        html = "<p style='text-align: center; color: #666;'>目前無通知</p>";
      } else {
        // 將通知分為未讀和已讀兩組，並按時間排序
        var unreadNotifs = notifications.filter(notif => notif.readTime === "").sort((a, b) => new Date(b.time) - new Date(a.time));
        var readNotifs = notifications.filter(notif => notif.readTime !== "").sort((a, b) => new Date(b.time) - new Date(a.time));

        // 合併未讀和已讀通知（未讀在上，已讀在下）
        var sortedNotifs = unreadNotifs.concat(readNotifs);

        sortedNotifs.forEach(function (notif) {
          var isRead = notif.readTime !== "";
          html += "<div class='notification-card " + (isRead ? "read" : "unread") + "'>";
          html += "<div class='notification-time'>" + notif.time + "</div>";
          html += "<div class='notification-publisher'>發布者: " + (notif.publisher || "未知") + "</div>";
          html += "<div class='notification-content'>" + (notif.content || "無內容") + "</div>";
          if (isRead) {
            html += "<button class='unread-btn' onclick='markNotificationUnread(" + (notif.id || 0) + ")'>標示為未讀</button>";
          } else {
            html += "<button class='read-btn' onclick='markNotificationRead(" + (notif.id || 0) + ")'>標為已讀</button>";
          }
          html += "</div>";
        });
      }
      document.getElementById("notificationList").innerHTML = html;
    })
    .withFailureHandler(function (error) {
      console.error("Failed to load notifications:", error);
      document.getElementById("notificationList").innerHTML =
        "<p style='text-align: center; color: #red;'>載入通知失敗：" + error.message + "</p>";
    })
    .getPersonalNotifications(currentAccount);
}

function markNotificationRead(id) {
  google.script.run.withSuccessHandler(function (result) {
    if (result.success) {
      loadPersonalNotifications();
    } else {
      alert("標記已讀失敗：" + result.error);
    }
  }).markNotificationAsRead(id, currentAccount);
}

function markNotificationUnread(id) {
  google.script.run.withSuccessHandler(function (result) {
    if (result.success) {
      loadPersonalNotifications();
    } else {
      alert("標記未讀失敗：" + result.error);
    }
  }).markNotificationAsUnread(id, currentAccount);
}

function markAllNotificationsRead() {
  google.script.run.withSuccessHandler(function (result) {
    if (result.success) {
      loadPersonalNotifications();
    } else {
      alert("全部標記已讀失敗：" + result.error);
    }
  }).markAllNotificationsAsRead(currentAccount);
}