const html = document.documentElement.outerHTML;
const url = window.location.href;
const words = window.htmlParser.extractVisibleTextFromHTML(html);
const imageUrls = window.htmlParser.extractImageUrlsFromHTML(html, url);

chrome.runtime.sendMessage({
  type: "PAGE_CONTENT",
  html: html,
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
  console.error(message.result.length);
  if (message.action === "changeContent" && message.result) {
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // URL 관련 속성 목록
    const urlAttributes = [
        "href", "src", "srcset", "action", "data", "poster", "formaction", "cite", "longdesc", "usemap", "manifest"
    ];

    let currentHtml = message.originhtml;

    for (const filterTargetStr of message.result) {
        if (!filterTargetStr?.trim()) continue;

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(currentHtml, 'text/html');
            const regex = new RegExp(escapeRegExp(filterTargetStr), 'g');

            const processNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = node.textContent.replace(regex, "***");
                } 
                else if (node.nodeType === Node.ELEMENT_NODE) {
                    // 속성 처리 (URL 속성은 제외)
                    Array.from(node.attributes).forEach(attr => {
                        if (!urlAttributes.includes(attr.name.toLowerCase())) {
                            attr.value = attr.value.replace(regex, "***");
                        }
                    });
                    Array.from(node.childNodes).forEach(processNode);
                }
            };

            processNode(doc.body);
            currentHtml = new XMLSerializer().serializeToString(doc);
        } catch (error) {
            console.error(`Error processing "${filterTargetStr}":`, error);
        }
    }

    document.body.innerHTML = currentHtml;
}

});