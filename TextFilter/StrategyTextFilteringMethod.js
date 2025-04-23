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