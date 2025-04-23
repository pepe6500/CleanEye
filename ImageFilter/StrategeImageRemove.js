import StrategyImageFilteringMethod from "./StrategyImageFilteringMethod.js";

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