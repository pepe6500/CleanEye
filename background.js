import NetworkManager from "./NetworkManager.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_CONTENT") {
        const html = message.html;
        const words = message.words;
        const imageUrls = message.imageUrls;
        chrome.storage.local.get(["harmLevel"], (result) => {
            const harmLevel = result.harmLevel ?? 50;
            NetworkManager.instance.SendContentData(html, words, imageUrls, harmLevel);
        });
    }
});
