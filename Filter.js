/**
 * Abstract base class for HTML content filtering
 * @abstract
 */
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
  