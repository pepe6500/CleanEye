/**
 * UserSettingManager class for managing user settings
 */
export default class UserSettingManager {
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