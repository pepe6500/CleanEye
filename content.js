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

  /**
  * Send text, image URLs, and harm level to the server (Client to Server)
  * @param {string} originhtml - The array of texts
  * @param {string[]} visibleText - The array of texts
  * @param {string[]} imageUrls - The array of image URLs
  * @param {number} harmLevel - The calculated harm level
  */
  async SendContentData(originhtml, visibleText, imageUrls, harmLevel) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "changeContent", originhtml: originhtml, result: visibleText });
    }

    return; // TODO<김동완>: 서버 작업 후 event 호출 및 return 제거 


    if (!Array.isArray(visibleText) || !Array.isArray(imageUrls) || typeof harmLevel !== 'number') {
      console.error("Invalid parameters for SendContentData");
      return;
    }

    fetch("http://3.35.204.105:3001/getDatas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        words: visibleText,
        images: imageUrls,
        dangerScore: harmLevel
      })
    })
      .then(response => {
        if (!response.ok) throw new Error("서버 응답 실패");
        return response.json();
      })
      .then(data => console.log("서버 응답:", data))
      .catch(error => console.error("전송 오류:", error));
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
  GetFilteredCode(html, filterTargetStr) {
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
  GetFilteredImageCode(html, filterTargetStr) {
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
      const replaceText = this.#strategyImageFilteringMethod.GetFilteredText(filterTargetStr);

      // 모든 <img> 태그를 선택
      const imgElements = doc.querySelectorAll('img');
      imgElements.forEach(img => {
        imageAttributes.forEach(attrName => {
          if (img.hasAttribute(attrName)) {
            img.setAttribute(
              attrName,
              img.getAttribute(attrName).replace(regex, replaceText)
            );
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
  #replaceText = "[Image Filtered]";

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
  GetFilteredCode(html, filterTargetStr) {
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
      const replaceText = this.#strategyTextFilteringMethod.GetFilteredText(filterTargetStr);
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
  GetFilteredText(filterTargetStr) {
    throw new Error("GetFilteredText method must be implemented by subclasses");
  }
}

class StrategeTextRemove extends StrategyTextFilteringMethod {
  /**
   * Remove text completely
   * @param {string} filterTargetStr - The target string to filter
   * @returns {string} Empty string to remove the text
   */
  GetFilteredText(filterTargetStr) {
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
  GetFilteredText(filterTargetStr) {
    return this.#replaceText;
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
    const textFilterType = this.#userSettingManager.GetValue('textFilterType') || 'replace';
    const textReplacement = this.#userSettingManager.GetValue('textReplacement') || '***';

    if (textFilterType === 'remove') {
      this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextRemove());
    } else {
      this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextReplace(textReplacement));
    }

    console.log(`Text filtering method updated to: ${textFilterType}`);
  }

  /**
   * Update image filtering method based on user settings
   */
  UpdateImageFilteringMethod() {
    const imageFilterType = this.#userSettingManager.GetValue('imageFilterType') || 'replace';
    const imageReplacement = this.#userSettingManager.GetValue('imageReplacement') || '[Image Filtered]';

    if (imageFilterType === 'remove') {
      this.#imageFilter.SetStrategyImageFilteringMethod(new StrategeImageRemove());
    } else {
      this.#imageFilter.SetStrategyImageFilteringMethod(new StrategeImageReplace(imageReplacement));
    }

    console.log(`Image filtering method updated to: ${imageFilterType}`);
  }

  /**
   * Handle text filter server-to-client response
   * @param {string[]} filteredText - The filtered text from the server
   */

  async HandleOnTextFilterSTC(originPagehtml, filteredText) {
    let result = originPagehtml;
    for (const filterTargetStr of filteredText) {
      if (!filterTargetStr?.trim()) continue;
      result = this.#textFilter.GetFilteredCode(result, filterTargetStr);
    }

    document.body.innerHTML = result;
  }

  /**
   * Handle image filter server-to-client response
   * @param {string} filteredImageURL - The filtered image URL from the server
   * @param {number} statusCode - The status code from the server
   */
  HandleOnImageFilterSTC(originPagehtml, filteredText) {
    let result = originPagehtml;
    for (const filterTargetStr of filteredText) {
      if (!filterTargetStr?.trim()) continue;
      result = this.#imageFilter.GetFilteredCode(result, filterTargetStr);
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
  console.error(message.result.length);

  if (message.action === "changeContent" && message.result) {
    filteringHandler.HandleOnTextFilterSTC(message.originhtml, message.result);
  } else if (message.action === "changeImageURL" && message.result)
  {
    filteringHandler.HandleOnImageFilterSTC(message.originhtml, message.result);
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


  chrome.storage.local.get(["harmLevel"], (result) => {
    const harmLevel = result.harmLevel ?? 50;
    if (sendImgList.length > 0) {
      console.log(sendImgList);
      sendImgsToServer(sendImgList, harmLevel);
      sendImgList.length = 0;
    }
    if (sendWordList.length > 0) {
      console.log(sendWordList);
      sendWordsToServer(sendWordList, harmLevel);
      sendWordList.length = 0;
    }
  });
};

const observer = new MutationObserver(observerCallback);

const textServerURL = "";
const imageServerURL = "http://ec2-15-165-160-164.ap-northeast-2.compute.amazonaws.com:8000";

window.addEventListener("load", () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  extractTextFromNode(document.body);
});

function sendWordsToServer(words, rate) {
  /*
  fetch(textServerURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ words, rate })
  })
    .then(res => {
      if (!res.ok) throw new Error("서버 응답 실패");
      console.log("[모든 단어 서버 전송 완료]");
    })
    .catch(err => {
      console.error("[서버 전송 오류]", err);
    });
    */
}

function sendImgsToServer(urls, rate) {
  fetch(imageServerURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ urls, rate })
  })
    .then(res => {
      if (!res.ok) throw new Error("서버 응답 실패");
      console.log("[모든 단어 서버 전송 완료]");
    })
    .catch(err => {
      console.error("[서버 전송 오류]", err);
    });
}

////////////////////