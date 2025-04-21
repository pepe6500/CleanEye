import NetworkManager from './NetworkManager.js';

const manager = NetworkManager.instance;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_CONTENT") {
        const words = message.words;
        const imageUrls = message.imageUrls;
        chrome.storage.local.get(["harmLevel"], (result) => {
            const harmLevel = result.harmLevel ?? 50;
            manager.SendContentData(words, imageUrls, harmLevel);
        });
    }
});
