chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "changeContent" && message.result) {
      document.body.innerHTML = message.result;
    }
  });