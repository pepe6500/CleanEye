import StrategyTextFilteringMethod from "./StrategyTextFilteringMethod.js";

export default class StrategeTextRemove extends StrategyTextFilteringMethod {
    /**
     * Remove text completely
     * @param {string} filterTargetStr - The target string to filter
     * @returns {string} Empty string to remove the text
     */
    GetFilteredText(filterTargetStr) {
        return "";
    }
}