import TextFilter from "./TextFilter/TextFilter.js";

const textFilter = new TextFilter();

const targethtml = `<!DOCTYPE html>
<html>

<body>
    aa
    ab
    bc
    cd
    dd
    abb
    aab
    abab
    bab
</body>

</html>`;
const result = textFilter.GetFilteredCode(targethtml, "ab");

let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

console.log("active " + tab.url)

chrome.tabs.sendMessage(tab.id, { action: "changeContent", result: result });





