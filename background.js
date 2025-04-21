import mySender from './HTMLParser/mySender.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_CONTENT") {
        const words = message.words;
        const imageUrls = message.imageUrls;
        chrome.storage.local.get(["harmLevel"], (result) => {
            const harmLevel = result.harmLevel ?? 50;
            mySender.sendToServer(words, imageUrls, harmLevel);
        });
    }
});
