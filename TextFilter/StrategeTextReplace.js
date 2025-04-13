import StrategyTextFilteringMethod from "./StrategyTextFilteringMethod.js";

export default class StrategeTextReplace extends StrategyTextFilteringMethod {
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