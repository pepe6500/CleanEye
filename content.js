const html = document.documentElement.outerHTML;
const url = window.location.href;
const words = window.htmlParser.extractVisibleTextFromHTML(html);
const imageUrls = window.htmlParser.extractImageUrlsFromHTML(html, url);

chrome.runtime.sendMessage({
  type: "PAGE_CONTENT",
  words: words,
  imageUrls: imageUrls
}).catch(err => console.error("메시지 전송 오류:", err));

/*
실시간 변화 감지
const observer = new MutationObserver(() => {
  const htmlSnapshot = document.documentElement.outerHTML;
  chrome.runtime.sendMessage({
    type: "HTML_SNAPSHOT",
    html: htmlSnapshot
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true
});
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "changeContent" && message.result) {
    document.body.innerHTML = message.result;
  }
});