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

fetch("http://3.35.204.105:3001/get-users")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Error:", error));