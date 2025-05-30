const textServerURL = "http://43.201.18.93:8080/api/text/analyze";
const imageServerURL = "http://ec2-15-164-134-227.ap-northeast-2.compute.amazonaws.com:8000/detect";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_TEXT") {
        const html = message.html;
        const words = message.words;
        const harmLevel = message.harmLevel;
        const type = message.filteringType;
        const requestUrl = message.requestUrl;
        sendWordsToServer(html, words, harmLevel, type, requestUrl);
    }
    else if (message.type === "PAGE_IMAGE") {
        const html = message.html;
        const imageUrls = message.urls;
        const harmLevel = message.harmLevel;
        const type = message.filteringType;
        const requestUrl = message.requestUrl;
        sendImgsToServer(html, imageUrls, harmLevel, type, requestUrl);
    }
});


function sendWordsToServer(html, words, rate, type, requestUrl) {
    console.error("sendWordsToServer");

    fetch(textServerURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ words, rate, type, requestUrl })
    })
        .then(async res => {
            if (!res.ok) throw new Error("서버 응답 실패");
            const data = await res.json();
            console.log("[모든 단어 서버 전송 완료] res: " + data.words);
            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                chrome.storage.local.get(["censorMethod"], (result) => {
                    if (result.censorMethod == data.type && tab.url == data.requestUrl) {
                        chrome.tabs.sendMessage(tab.id, { action: "changeContent", originhtml: html, result: data});
                    }
                });
            }
        })
        .catch(err => {
            console.error("[서버 전송 오류]", err);
        });
}

function sendImgsToServer(html, urls, rate, type, requestUrl) {
    console.error("sendImgsToServer");

    fetch(imageServerURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ urls, rate, type, requestUrl })
    })
        .then(async res => {
            if (!res.ok) throw new Error("서버 응답 실패");
            const data = await res.json();
            console.log("[모든 URL 서버 전송 완료] " + data.urls);

            let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {

                chrome.storage.local.get(["imageFilterMethod"], (result) => {
                    if (result.imageFilterMethod == data.type && tab.url == data.requestUrl) {
                        chrome.tabs.sendMessage(tab.id, { action: "changeImageURL", requestUrl: html, result: data});
                    }
                });
            }
        })
        .catch(err => {
            console.error("[서버 전송 오류]", err);
        });
}
