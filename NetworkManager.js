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
     * @private
     * @type {string}
     */
    #textProcessServerURL = "";

    /**
     * @private
     * @type {Array<function(string, number): void>}
     */
    #textFilterEventList = [];

    /**
     * @private
     * @type {string}
     */
    #imageProcessServerURL = "";

    /**
     * @private
     * @type {Array<function(string, number): void>}
     */
    #imageFilterEventList = [];

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

        fetch(this.#textProcessServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        })
            .then(response => response.json())
            .then(data => {
                // Assuming the server returns filtered text and a status code
                this.#textFilterEventList.forEach(event => {
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
        if (!this.#textFilterEventList.includes(event)) {
            this.#textFilterEventList.push(event);
        }
    }

    /**
     * Remove an event listener for text filter responses
     * @param {function(string, number): void} event - The event callback function to remove
     */
    RemoveTextFilterSTCEvent(event) {
        const index = this.#textFilterEventList.indexOf(event);
        if (index !== -1) {
            this.#textFilterEventList.splice(index, 1);
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

        fetch(this.#imageProcessServerURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageURL })
        })
            .then(response => response.json())
            .then(data => {
                // Assuming the server returns filtered image URL and a status code
                this.#imageFilterEventList.forEach(event => {
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
        if (!this.#imageFilterEventList.includes(event)) {
            this.#imageFilterEventList.push(event);
        }
    }

    /**
     * Remove an event listener for image filter responses
     * @param {function(string, number): void} event - The event callback function to remove
     */
    RemoveImageFilterSTCEvent(event) {
        const index = this.#imageFilterEventList.indexOf(event);
        if (index !== -1) {
            this.#imageFilterEventList.splice(index, 1);
        }
    }

    /**
 * Send text, image URLs, and harm level to the server (Client to Server)
 * @param {string[]} visibleText - The array of texts
 * @param {string[]} imageUrls - The array of image URLs
 * @param {number} harmLevel - The calculated harm level
 */
    SendContentData(visibleText, imageUrls, harmLevel) {
        console.log(typeof visibleText);
        console.log(typeof imageUrls);
        console.log(typeof harmLevel);

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
