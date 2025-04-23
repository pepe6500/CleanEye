/**
 * NetworkManager class for handling text and image filtering operations
 */
export default class NetworkManager {
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
        
        return NetworkManager.#instance;
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
        if (tab)
        {
            chrome.tabs.sendMessage(tab.id, { action: "changeContent", originhtml: originhtml, result: visibleText});
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

// Usage example:
// const networkManager = NetworkManager.instance;
// networkManager.AddTextFilterSTCEvent((filteredText, statusCode) => {
//     console.log("Filtered text:", filteredText, "Status:", statusCode);
// });
// networkManager.TextFilterCTS("Text to filter");
