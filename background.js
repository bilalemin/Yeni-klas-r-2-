// Yan panel davranış ayarı
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

// Floating buton tıklandığında yan paneli açma mesajı
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_side_panel" && sender.tab) {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }
});
