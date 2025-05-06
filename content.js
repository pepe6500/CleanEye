import { extractTextFromNode } from "./HTMLParser/htmlParser.js";

const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach(node => extractTextFromNode(node));
        } else if (mutation.type === "characterData") {
            extractTextFromNode(mutation.target);
        }
    }
});

window.addEventListener("load", () => {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    extractTextFromNode(document.body);
    console.log("[텍스트 및 이미지 추출 시작]");
});
////////////////////

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "changeContent" && message.result) {
    document.body.innerHTML = message.result;
  }
});