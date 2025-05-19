class NetworkManager {
    /**
     * @private
     * @type {NetworkManager}
     */
    static #instance = null;

    /**
     * @public
     * @type {string}
     */
    originPagehtml = ""

    /**
     * @private
     * @type {string}
     */
    static #textProcessServerURL = "";

    /**
     * @private
     * @type {Array<function(string[]): void>}
     */
    static #textFilterEventList = [];

    /**
     * @private
     * @type {string}
     */
    static #imageProcessServerURL = "";

    /**
     * @private
     * @type {Array<function(string[]): void>}
     */
    static #imageFilterEventList = [];

    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        if (NetworkManager.#instance) {
            throw new Error("NetworkManager is a singleton. Use NetworkManager.instance instead.");
        }
        NetworkManager.#instance = this;
    }

    /**
     * Get the singleton instance of NetworkManager
     * @returns {NetworkManager} The singleton instance
     */
    static get instance() {
        if (!NetworkManager.#instance) {
            NetworkManager.#instance = new NetworkManager();
        }
    }

    /**
     * Send text to the server for filtering (Client to Server)
     * @param {string} text - The text to be filtered
     */
    TextFilterCTS(text) {
        if (!text || typeof text !== 'string') {
            console.error("Invalid text parameter");
            return;
        }

        fetch(NetworkManager.#textProcessServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        })
            .then(response => response.json())
            .then(data => {
                // Assuming the server returns filtered text and a status code
                this.textFilterEventList.forEach(event => {
                    event(data.filteredText, data.statusCode);
                });
            })
            .catch(error => {
                console.error("Error in TextFilterCTS:", error);
            });
    }

    /**
     * Add an event listener for text filter responses (Server to Client)
     * @param {function(string, number): void} event - The event callback function
     */
    AddTextFilterSTCEvent(event) {
        if (typeof event !== 'function') {
            console.error("Event must be a function");
            return;
        }
        if (!NetworkManager.#textFilterEventList.includes(event)) {
            console.error("AddTextFilterSTCEvent " + event.name);
            NetworkManager.#textFilterEventList.push(event);
            console.error("AddTextFilterSTCEvent lenght " + NetworkManager.#textFilterEventList.length);
        }
    }

    /**
     * Remove an event listener for text filter responses
     * @param {function(string, number): void} event - The event callback function to remove
     */
    RemoveTextFilterSTCEvent(event) {
        const index = NetworkManager.#textFilterEventList.indexOf(event);
        if (index !== -1) {
            NetworkManager.#textFilterEventList.splice(index, 1);
            console.error("RemoveTextFilterSTCEvent lenght " + NetworkManager.#textFilterEventList.length);
        }
    }

    /**
     * Send image URL to the server for filtering (Client to Server)
     * @param {string} imageURL - The URL of the image to be filtered
     */
    ImageFilterCTS(imageURL) {
        if (!imageURL || typeof imageURL !== 'string') {
            console.error("Invalid imageURL parameter");
            return;
        }

        fetch(NetworkManager.#imageProcessServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageURL })
        })
            .then(response => response.json())
            .then(data => {
                // Assuming the server returns filtered image URL and a status code
                NetworkManager.#imageFilterEventList.forEach(event => {
                    event(data.filteredImageURL, data.statusCode);
                });
            })
            .catch(error => {
                console.error("Error in ImageFilterCTS:", error);
            });
    }

    /**
     * Add an event listener for image filter responses (Server to Client)
     * @param {function(string, number): void} event - The event callback function
     */
    AddImageFilterSTCEvent(event) {
        if (typeof event !== 'function') {
            console.error("Event must be a function");
            return;
        }
        if (!NetworkManager.#imageFilterEventList.includes(event)) {
            NetworkManager.#imageFilterEventList.push(event);
        }
    }

    /**
     * Remove an event listener for image filter responses
     * @param {function(string, number): void} event - The event callback function to remove
     */
    RemoveImageFilterSTCEvent(event) {
        const index = NetworkManager.#imageFilterEventList.indexOf(event);
        if (index !== -1) {
            NetworkManager.#imageFilterEventList.splice(index, 1);
        }
    }
}

class UserSettingManager {
    /**
     * @private
     * @type {Map<string, string>}
     */
    #settingValueList = new Map();

    /**
     * @private
     * @type {Array<function(string, string): void>}
     */
    #updateSettingValueEventList = [];

    /**
     * Create a new UserSettingManager
     */
    constructor() {
        // Initialize with default settings if needed
    }

    /**
     * Set a setting value and trigger update events
     * @param {string} key - The setting key
     * @param {string} value - The setting value
     */
    SetValue(key, value) {
        if (!key || typeof key !== 'string') {
            console.error("Invalid key parameter");
            return;
        }

        const oldValue = this.#settingValueList.get(key);
        this.#settingValueList.set(key, value);

        // Notify listeners if the value has changed
        if (oldValue !== value) {
            this.#updateSettingValueEventList.forEach(event => {
                event(key, value);
            });
        }
    }

    /**
     * Get a setting value
     * @param {string} key - The setting key
     * @returns {string|undefined} The setting value or undefined if not found
     */
    GetValue(key) {
        if (!key || typeof key !== 'string') {
            console.error("Invalid key parameter");
            return undefined;
        }
        return this.#settingValueList.get(key);
    }

    /**
     * Add an event listener for setting value updates
     * @param {function(string, string): void} event - The event callback function
     */
    AddUpdateSettingValueEvent(event) {
        if (typeof event !== 'function') {
            console.error("Event must be a function");
            return;
        }
        if (!this.#updateSettingValueEventList.includes(event)) {
            this.#updateSettingValueEventList.push(event);
        }
    }

    /**
     * Remove an event listener for setting value updates
     * @param {function(string, string): void} event - The event callback function to remove
     */
    RemoveUpdateSettingValueEvent(event) {
        const index = this.#updateSettingValueEventList.indexOf(event);
        if (index !== -1) {
            this.#updateSettingValueEventList.splice(index, 1);
        }
    }
}

class Filter {
    /**
     * Filter HTML content based on a target string
     * @abstract
     * @param {string} html - The HTML content to filter
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The filtered HTML content
     * @throws {Error} If not implemented by subclass
     */
    GetFilteredCode(html, filterTargetStr, data) {
        throw new Error("GetFilteredCode must be implemented by subclasses");
    }
}

class ImageFilter extends Filter {
    /**
     * @private
     * @type {StrategyImageFilteringMethod}
     */
    #strategyImageFilteringMethod;

    /**
     * Create a new ImageFilter with default strategy
     */
    constructor() {
        super();
        // Default to replace strategy
        this.#strategyImageFilteringMethod = new StrategeImageReplace();
    }

    /**
     * Filter HTML content by applying the current strategy to image tags
     * @param {string} html - The HTML content to filter
     * @param {string} filterTargetStr - The target string to identify images to filter
     * @returns {string} The filtered HTML content
     */
    GetFilteredCode(html, filterTargetStr, data) {
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 이미지 관련 속성 목록
        const imageAttributes = [
            "src", "srcset", "alt", "title", "longdesc"
        ];

        let result = html;

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(result, 'text/html');
            const regex = new RegExp(escapeRegExp(filterTargetStr), 'g');
            const replaceText = this.#strategyImageFilteringMethod.GetFilteredImage(filterTargetStr, data);

            // 모든 <img> 태그를 선택
            const imgElements = doc.querySelectorAll('img');
            imgElements.forEach(img => {
                imageAttributes.forEach(attrName => {
                    if (img.hasAttribute(attrName)) {
                        img.setAttribute(
                            attrName,
                            img.getAttribute(attrName).replace(regex, replaceText)
                        );

                        console.error("img.setAttribute : " + img.getAttribute(attrName) + " / " + regex);
                    }
                });
            });

            result = new XMLSerializer().serializeToString(doc);
        } catch (error) {
            console.error(`Error processing image attribute "${filterTargetStr}":`, error);
        }

        return result;
    }

    /**
     * Set the image filtering strategy
     * @param {StrategyImageFilteringMethod} strategy - The strategy to use
     */
    SetStrategyImageFilteringMethod(strategy) {
        if (!(strategy instanceof StrategyImageFilteringMethod)) {
            console.error("Strategy must be an instance of StrategyImageFilteringMethod");
            return;
        }
        this.#strategyImageFilteringMethod = strategy;
    }
}

class StrategyImageFilteringMethod {
    /**
     * Get filtered image based on the strategy
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The filtered image result
     */
    GetFilteredImage(filterTargetStr) {
        throw new Error("GetFilteredImage method must be implemented by subclasses");
    }
}

class StrategeImageRemove extends StrategyImageFilteringMethod {
    /**
     * Remove image completely
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} Empty string to remove the image
     */
    GetFilteredImage(filterTargetStr) {
        return "";
    }
}

class StrategeImageReplace extends StrategyImageFilteringMethod {
    /**
     * @private
     * @type {string}
     * @readonly
     */
    #replaceText = "https://us.123rf.com/450wm/aquir/aquir1309/aquir130900039/21904413-%EA%B2%80%EC%97%B4-%ED%95%9C-%EB%B9%A8%EA%B0%84-%EC%A0%95%EC%82%AC%EA%B0%81%ED%98%95-%EB%8F%84%EC%9E%A5.jpg";

    /**
     * Create a new StrategeImageReplace instance
     * @param {string} [replaceText] - Optional custom replacement text
     */
    constructor(replaceText) {
        super();
        if (replaceText) {
            this.#replaceText = replaceText;
        }
    }

    /**
     * Replace image with text
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The replacement text
     */
    GetFilteredImage(filterTargetStr) {
        return this.#replaceText;
    }
}

class StrategeImageReplaceByServerValue extends StrategyImageFilteringMethod {

    constructor() {
        super();
    }

    GetFilteredImage(filterTargetStr, data) {
        var i;
        for (i = 0; i < data.urls.length; i++)
        {
            if (data.urls[i] == filterTargetStr)
            {
                return data.filteredUrls[i];
            }
        }
        return "";
    }
}

class TextFilter extends Filter {
    /**
    * @private
    * @type {StrategyTextFilteringMethod}
    */
    #strategyTextFilteringMethod;

    /**
    * Create a new TextFilter with default strategy
    */
    constructor() {
        super();
        // Default to replace strategy
        this.#strategyTextFilteringMethod = new StrategeTextReplace();
    }

    /**
    * Set the text filtering strategy
    * @param {StrategyTextFilteringMethod} strategy - The strategy to use
    */
    SetStrategyTextFilteringMethod(strategy) {
        if (!(strategy instanceof StrategyTextFilteringMethod)) {
            console.error("Strategy must be an instance of StrategyTextFilteringMethod");
            return;
        }
        this.#strategyTextFilteringMethod = strategy;
    }

    /**
    * Filter HTML content by applying the current strategy to text nodes
    * @param {string} html - The HTML content to filter
    * @param {string} filterTargetStr - The target string to identify text to filter
    * @returns {string} The filtered HTML content
    */
    GetFilteredCode(html, filterTargetStr, data) {
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // URL 관련 속성 목록
        const urlAttributes = [
            "href", "src", "srcset", "action", "data", "poster", "formaction", "cite", "longdesc", "usemap", "manifest"
        ];

        let result = html;

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(result, 'text/html');
            const regex = new RegExp(escapeRegExp(filterTargetStr), 'g');
            const replaceText = this.#strategyTextFilteringMethod.GetFilteredText(filterTargetStr, data);
            const processNode = (node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = node.textContent.replace(regex, replaceText);
                }
                else if (node.nodeType === Node.ELEMENT_NODE) {
                    // 속성 처리 (URL 속성은 제외)
                    Array.from(node.attributes).forEach(attr => {
                        if (!urlAttributes.includes(attr.name.toLowerCase())) {
                            attr.value = attr.value.replace(regex, replaceText);
                        }
                    });
                    Array.from(node.childNodes).forEach(processNode);
                }
            };

            processNode(doc.body);
            result = new XMLSerializer().serializeToString(doc);
        } catch (error) {
            console.error(`Error processing "${filterTargetStr}":`, error);
        }

        return result;
    }
}

class StrategyTextFilteringMethod {
    /**
     * Get filtered text based on the strategy
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The filtered text result
     */
    GetFilteredText(filterTargetStr, data) {
        throw new Error("GetFilteredText method must be implemented by subclasses");
    }
}

class StrategeTextRemove extends StrategyTextFilteringMethod {
    /**
     * Remove text completely
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} Empty string to remove the text
     */
    GetFilteredText(filterTargetStr, data) {
        return "";
    }
}

class StrategeTextReplace extends StrategyTextFilteringMethod {
    /**
     * @private
     * @type {string}
     * @readonly
     */
    #replaceText = "***";

    /**
     * Create a new StrategeTextReplace instance
     * @param {string} [replaceText] - Optional custom replacement text
     */
    constructor(replaceText) {
        super();
        if (replaceText) {
            this.#replaceText = replaceText;
        }
    }

    /**
     * Replace target text with replacement text
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The replacement text
     */
    GetFilteredText(filterTargetStr, data) {
        return this.#replaceText;
    }
}

class StrategeTextStrikethrough extends StrategyTextFilteringMethod {
    /**
     * @private
     * @type {string}
     * @readonly
     */
    #prefix = "<s>"
    #suffix = "</s>";

    /**
     * Create a new StrategeTextStrikethrough instance
     * @param {string} [prefix] - Optional custom prefix for strikethrough
     * @param {string} [suffix] - Optional custom suffix for strikethrough
     */
    constructor(prefix, suffix) {
        super();
        if (prefix) {
            this.#prefix = prefix;
        }
        if (suffix) {
            this.#suffix = suffix;
        }
    }

    /**
     * Apply strikethrough to the target text
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The strikethrough text
     */
    GetFilteredText(filterTargetStr, data) {
        return this.#prefix + filterTargetStr + this.#suffix;
    }
}

class StrategeTextBlur extends StrategyTextFilteringMethod {
    /**
     * @private
     * @type {string}
     * @readonly
     */
    #blurStyle = "filter: blur(4px);";

    /**
     * Create a new StrategeTextBlur instance
     * @param {string} [blurStyle] - Optional custom CSS blur style
     */
    constructor(blurStyle) {
        super();
        if (blurStyle) {
            this.#blurStyle = blurStyle;
        }
    }

    /**
     * Apply blur effect to the target text (HTML output)
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} The blurred HTML string
     */
    GetFilteredText(filterTargetStr, data) {
        return `<span style="${this.#blurStyle}">${filterTargetStr}</span>`;
    }
}

class StrategeTextReplaceByServerValue extends StrategyTextFilteringMethod {

    constructor() {
        super();
    }

    GetFilteredText(filterTargetStr, data) {
        var i;
        for (i = 0; i < data.words.length; i++)
        {
            if (data.words[i] == filterTargetStr)
            {
                return data.filteredWords[i];
            }
        }
        return "";
    }
}


class FilteringHandler {
    /**
     * @private
     * @type {ImageFilter}
     */
    #imageFilter;

    /**
     * @private
     * @type {TextFilter}
     */
    #textFilter;

    /**
     * @private
     * @type {UserSettingManager}
     */
    #userSettingManager;

    /**
     * Create a new FilteringHandler
     * @param {UserSettingManager} userSettingManager - The user setting manager
     */
    constructor(userSettingManager) {
        this.#userSettingManager = userSettingManager;
        this.#textFilter = new TextFilter();
        this.#imageFilter = new ImageFilter();
    }

    /**
     * Initialize the filtering handler
     */
    Init() {
        // Initialize filters based on current user settings
        this.UpdateTextFilteringMethod();
        this.UpdateImageFilteringMethod();

        // Initialize event handlers
        this.InitEvents();

        console.log("FilteringHandler initialized");
    }

    /**
     * Initialize event handlers
     */
    InitEvents() {
        // Add settings event listener
        this.#userSettingManager.AddUpdateSettingValueEvent(this.HandleOnUpdateSettingValue.bind(this));

        console.log("FilteringHandler events initialized");
    }

    /**
     * Update text filtering method based on user settings
     */
    UpdateTextFilteringMethod() {
        chrome.storage.local.get(["censorMethod"], (result) => {
            const textFilterType = result;
            const textReplacement = '***';

            if (textFilterType === 1) {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextReplace(textReplacement));
            } else if (textFilterType === 2) {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextStrikethrough());
            } else if (textFilterType === 3) {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextBlur());
            } else if (textFilterType === 4) {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextReplaceByServerValue());
            } else {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextReplace(textReplacement));
            }

            console.log(`Text filtering method updated to: ${textFilterType}`);
        });
    }

    /**
     * Update image filtering method based on user settings
     */
    UpdateImageFilteringMethod() {

        chrome.storage.local.get(["imageFilterMethod"], (result) => {
            const imageFilterType = result;

            if (imageFilterType === 1) {
                this.#imageFilter.SetStrategyImageFilteringMethod(new StrategeImageReplace());
            } else if (imageFilterType === 2) {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeImageReplaceByServerValue());
            } else if (imageFilterType === 3) {
                this.#textFilter.SetStrategyTextFilteringMethod(new StrategeImageReplaceByServerValue());
            } else {
                this.#imageFilter.SetStrategyImageFilteringMethod(new StrategeImageReplace());
            }

            console.log(`Text filtering method updated to: ${imageFilterType}`);
        });

        

        console.log(`Image filtering method updated to: ${imageFilterType}`);
    }

    async HandleOnTextFilterSTC(originPagehtml, data) {
        let result = originPagehtml;

        for (const filterTargetStr of data.urls) {
            if (!filterTargetStr?.trim()) continue;
            result = this.#textFilter.GetFilteredCode(result, filterTargetStr, data);
        }

        document.body.innerHTML = result;
    }

    /**
     * Handle image filter server-to-client response
     * @param {string} filteredImageURL - The filtered image URL from the server
     * @param {number} statusCode - The status code from the server
     */
    HandleOnImageFilterSTC(originPagehtml, filteredText, data) {
        let result = originPagehtml;
        for (const filterTargetStr of filteredText) {
            if (!filterTargetStr?.trim()) continue;
            result = this.#imageFilter.GetFilteredCode(result, filterTargetStr, data);
        }

        document.body.innerHTML = result;
    }

    /**
     * Handle setting value updates
     * @param {string} key - The setting key that was updated
     * @param {string} value - The new setting value
     */
    HandleOnUpdateSettingValue(key, value) {
        console.log(`Setting updated: ${key} = ${value}`);

        // Update filtering methods if relevant settings changed
        if (['textFilterType', 'textReplacement'].includes(key)) {
            this.UpdateTextFilteringMethod();
        } else if (['imageFilterType', 'imageReplacement'].includes(key)) {
            this.UpdateImageFilteringMethod();
        }

        // Refresh content if needed
        if (['additionalTextFilters', 'additionalImageFilters'].includes(key)) {
            console.log("Refreshing content due to filter changes");
            // Here you would typically trigger a refresh of the filtered content
        }
    }

    /**
     * Handle cleanup when the application is closing
     * @param {Event} event - The beforeunload event
     */
    HandleOnExit(event) {
        // Remove event listeners
        this.#userSettingManager.RemoveUpdateSettingValueEvent(this.HandleOnUpdateSettingValue);

        // Save any pending settings
        // this.#userSettingManager.SaveSettings(); // If implemented

        console.log("FilteringHandler cleaned up");
    }
}

const userSettingManager = new UserSettingManager();
const filteringHandler = new FilteringHandler(userSettingManager);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "changeContent" && message.result) {
        filteringHandler.HandleOnTextFilterSTC(document.documentElement.outerHTML, message.result);
    } else if (message.action === "changeImageURL" && message.result) {
        filteringHandler.HandleOnImageFilterSTC(document.documentElement.outerHTML, message.result);
    } else if (message.action === "changeSelectedMethod" && message.result) {
        filteringHandler.UpdateTextFilteringMethod();
    } else if (message.action === "changeImageFilterMethod" && message.result) {
        filteringHandler.UpdateImageFilteringMethod();
    }
});

///////////////////////////////////////
const knownWords = new Set();
const knownImages = new Set();
const sendWordList = [];
const sendImgList = [];

// 불필요한 단어를 걸러내는 함수
function isGarbageWord(word) {
    return (
        word.length > 25 ||                              // 너무 긴 단어
        /cls\d+fill/i.test(word) ||                      // 예: cls1fill, cls2fill
        /hashtaglandingpage/i.test(word) ||              // 해시태그 접두사
        /(animation|keyframes|fade(in|out)?)/i.test(word) || // 애니메이션 관련
        /^(Roboto|Arial|sansserif)$/i.test(word) ||      // 폰트 이름
        /px$|s$/.test(word)                              // 단위 (px, s)
    );
}

function extractNewWordsFromText(text) {
    const words = text.trim().split(/\s+/);
    let result = [];
    words.forEach(word => {
        const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, "");
        if (
            cleanWord &&
            !knownWords.has(cleanWord) &&
            !/^\d+$/.test(cleanWord) &&       // 숫자 제외
            !isGarbageWord(cleanWord)         // 쓰레기 단어 제외
        ) {
            knownWords.add(cleanWord);
            sendWordList.push(cleanWord);
        }
    });

    // 서버로 result 전송

}

function extractImageFromNode(node) {
    if (node.nodeName === "IMG") {
        const src = node.src;
        if (src && !knownImages.has(src)) {
            knownImages.add(src);
            sendImgList.push(src);
        }
    }

    // 이미지가 하위 요소로 있는 경우도 처리
    node.querySelectorAll?.("img").forEach(img => {
        const src = img.src;
        if (src && !knownImages.has(src)) {
            knownImages.add(src);
            sendImgList.push(src);
        }
    });
}

function extractTextFromNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent) return;
        const style = window.getComputedStyle(parent);
        const isVisible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0";

        if (isVisible) {
            const text = node.nodeValue.trim();
            if (text.length > 0) {
                extractNewWordsFromText(text);
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (!["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)) {
            extractImageFromNode(node);
            node.childNodes.forEach(child => extractTextFromNode(child));
        }
    }
}

async function getHarmLevel() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["harmLevel"], (result) => {
            const harmLevel = result.harmLevel ?? 50;  // 기본값 50
            resolve(harmLevel);
        });
    });
}

const observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach(node => extractTextFromNode(node));
        } else if (mutation.type === "characterData") {
            extractTextFromNode(mutation.target);
        }
    }

    chrome.storage.local.get(["harmLevel", "censorMethod", "imageFilterMethod"], (result) => {
        const harmLevel = result.harmLevel ?? 50;
        const html = document.documentElement.outerHTML;
        const requestUrl = document.URL;
        if (sendImgList.length > 0) {
            const filteringType = result.imageFilterMethod ?? 1;
            console.log(sendImgList);
            // sendImgsToServer(sendImgList, harmLevel);
            console.error("chrome.runtime.sendMessage PAGE_IMAGE");
            chrome.runtime.sendMessage({
                type: "PAGE_IMAGE",
                html: html,
                urls: sendImgList,
                harmLevel: harmLevel,
                filteringType: filteringType,
                requestUrl: requestUrl
            }).catch(err => console.error("메시지 전송 오류:", err));
            sendImgList.length = 0;
        }
        if (sendWordList.length > 0) {
            const filteringType = result.censorMethod ?? 1;
            console.log(sendWordList);
            // sendWordsToServer(sendWordList, harmLevel);
            chrome.runtime.sendMessage({
                type: "PAGE_TEXT",
                html: html,
                words: sendWordList,
                harmLevel: harmLevel,
                filteringType: filteringType,
                requestUrl: requestUrl
            }).catch(err => console.error("메시지 전송 오류:", err));
            sendWordList.length = 0;
        }
    });
};

const observer = new MutationObserver(observerCallback);

window.addEventListener("load", () => {
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    extractTextFromNode(document.body);
});

////////////////////