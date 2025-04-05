document.getElementById('getHTML').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: getPageHTML,
        }, displayResult);
    });
});

function getPageHTML() {
    return document.documentElement.outerHTML;
}

function displayResult(results) {
    extractVisibleTextFromHTML(results[0].result);

    const htmlString = results[0].result; // HTML 문자열
    const visibleText = extractVisibleTextFromHTML(htmlString);
    
    document.getElementById('result').innerText = visibleText;

    // POST 요청으로 배열을 서버에 전송
    fetch("http://3.35.204.105:3001/save-words", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ words: visibleText }) // words라는 키로 배열을 보냄
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("서버 응답 실패");
            }
            return response.json();
        })
        .then(data => {
            console.log("서버 응답:", data);
        })
        .catch(error => {
            console.error("전송 오류:", error);
        });
}

function extractVisibleTextFromHTML(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // 1. 스크립트, 스타일, 메타, 링크 등 제거
    const junkTags = tempDiv.querySelectorAll("script, style, meta, link, head, noscript");
    junkTags.forEach(tag => tag.remove());

    // 2. display:none, visibility:hidden 요소 제거
    const hiddenEls = tempDiv.querySelectorAll('[style*="display:none"], [style*="display: none"], [style*="visibility:hidden"], [style*="visibility: hidden"]');
    hiddenEls.forEach(el => el.remove());

    // 3. 주석 제거
    const removeComments = node => {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === Node.COMMENT_NODE) {
                node.removeChild(child);
                i--;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                removeComments(child);
            }
        }
    };
    removeComments(tempDiv);

    // 4. 사용자에게 보이는 텍스트만 추출
    let rawText = tempDiv.innerText;

    // 5. 공백 줄 정리 (여러 줄 → 하나, 앞뒤 공백 제거)
    let cleanText = rawText
        .replace(/\s{2,}/g, ' ')        // 연속 공백 → 한 칸
        .replace(/\n{2,}/g, '\n')       // 연속 줄바꿈 → 한 줄
        .replace(/^\s+|\s+$/gm, '')     // 각 줄 앞뒤 공백 제거
        .trim();                        // 전체 앞뒤 공백 제거

    // 6. 단어 배열로 변환
    const wordArray = cleanText
        .split(/\s+/)
        .filter(word => word); // 빈 문자열 제거

    const uniqueWords = [...new Set(wordArray)]; // 중복 제거

    return uniqueWords;
}



fetch("http://3.35.204.105:3001/get-users")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error:", error));