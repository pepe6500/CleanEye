const textServerURL = "http://52.79.113.63:8080/api/text/analyze";
const imageServerURL = "http://ec2-15-165-160-164.ap-northeast-2.compute.amazonaws.com:8000/detect";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PAGE_TEXT") {
        const html = message.html;
        const words = message.words;
        const harmLevel = message.harmLevel;
        sendWordsToServer(html, words, harmLevel);
    }
    else if (message.type === "PAGE_IMAGE") {
        const html = message.html;
        const imageUrls = message.urls;
        const harmLevel = message.harmLevel;
        sendImgsToServer(html, imageUrls, harmLevel);
    }
});


function sendWordsToServer(html, words, rate) {
    console.error("sendWordsToServer");

    fetch(textServerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ words, rate })
    })
      .then(async res => {
        if (!res.ok) throw new Error("서버 응답 실패");
        console.log("[모든 단어 서버 전송 완료]");

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab)
        {
            chrome.tabs.sendMessage(tab.id, { action: "changeContent", originhtml: html, result: res.words});
        }
      })
      .catch(err => {
        console.error("[서버 전송 오류]", err);
      });
  }
  
  function sendImgsToServer(html, urls, rate) {
    console.error("sendImgsToServer");

    fetch(imageServerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ urls, rate })
    })
      .then( async res => {
        if (!res.ok) throw new Error("서버 응답 실패");
        console.log("[모든 단어 서버 전송 완료]");

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab)
        {
            chrome.tabs.sendMessage(tab.id, { action: "changeImageURL", originhtml: html, result: res.urls});
        }
      })
      .catch(err => {
        console.error("[서버 전송 오류]", err);
      });
  }
