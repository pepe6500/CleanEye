import StrategyImageFilteringMethod from "./StrategyImageFilteringMethod.js";

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