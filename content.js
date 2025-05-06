const html = document.documentElement.outerHTML;
const url = window.location.href;
const words = window.htmlParser.extractVisibleTextFromHTML(html);
const imageUrls = window.htmlParser.extractImageUrlsFromHTML(html, url);

chrome.runtime.sendMessage({
  type: "PAGE_CONTENT",
  words: words,
  imageUrls: imageUrls
}).catch(err => console.error("메시지 전송 오류:", err));

///////////////////////////////////////

const knownWords = new Set();

function extractNewWordsFromText(text) {
  const words = text.trim().split(/\s+/);
  words.forEach(word => {
      const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, ""); // 특수문자 제거
      if (
          cleanWord &&
          !knownWords.has(cleanWord) &&
          !/^\d+$/.test(cleanWord) // 숫자만 있는 경우는 제외
      ) {
          knownWords.add(cleanWord);
          console.log("[새 단어]", cleanWord);
      }
  });
}

function extractTextFromNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
      // 시각적으로 보이는 텍스트만 처리
      const parent = node.parentElement;
      const style = window.getComputedStyle(parent);

      const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0";

      if (isVisible) {
          const text = node.nodeValue.trim();
          if (text.length > 0) {
              extractNewWordsFromText(text);
          }
      }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
      // script, style, noscript 태그 제외
      if (!["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)) {
          node.childNodes.forEach(child => extractTextFromNode(child));
      }
  }
}

const observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach(node => extractTextFromNode(node));
        } else if (mutation.type === "characterData") {
            extractTextFromNode(mutation.target);
        }
    }
};

const observer = new MutationObserver(observerCallback);

window.addEventListener("load", () => {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    extractTextFromNode(document.body);
    console.log("[단어 추출 시작]");
});

////////////////////
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "changeContent" && message.result) {
    document.body.innerHTML = message.result;
  }
});