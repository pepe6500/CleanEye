///////////////////////////////////////
const knownWords = new Set();
const knownImages = new Set();

function extractNewWordsFromText(text) {
  const words = text.trim().split(/\s+/);
  words.forEach(word => {
    const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, "");
    if (
      cleanWord &&
      !knownWords.has(cleanWord) &&
      !/^\d+$/.test(cleanWord)
    ) {
      knownWords.add(cleanWord);
      console.log("[새 단어]", cleanWord);
    }
  });
}

function extractImageFromNode(node) {
  if (node.nodeName === "IMG") {
    const src = node.src;
    if (src && !knownImages.has(src)) {
      knownImages.add(src);
      console.log("[이미지 URL]", src);
    }
  }

  // 이미지가 하위 요소로 있는 경우도 처리
  node.querySelectorAll?.("img").forEach(img => {
    const src = img.src;
    if (src && !knownImages.has(src)) {
      knownImages.add(src);
      console.log("[이미지 URL]", src);
    }
  });
}

function extractTextFromNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (!parent) return;
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
    if (!["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)) {
      extractImageFromNode(node);
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