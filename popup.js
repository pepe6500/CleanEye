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
    document.getElementById('result').innerText = results[0].result;
}