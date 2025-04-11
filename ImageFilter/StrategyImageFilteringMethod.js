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