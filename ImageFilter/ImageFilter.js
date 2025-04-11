class ImageFilter extends Filter {
    /**
     * @private
     * @type {StrategyImageFilteringMethod}
     */
    #strategyImageFilteringMethod;

    /**
     * Create a new ImageFilter with default strategy
     */
    constructor() {
        // Default to replace strategy
        this.#strategyImageFilteringMethod = new StrategeImageReplace();
    }

    /**
     * Filter HTML content by applying the current strategy to image tags
     * @param {string} html - The HTML content to filter
     * @param {string} filterTargetStr - The target string to identify images to filter
     * @returns {string} The filtered HTML content
     */
    GetFilteredCode(html, filterTargetStr) {
        if (!html || typeof html !== 'string') {
            console.error("Invalid HTML parameter");
            return html;
        }

        if (!filterTargetStr || typeof filterTargetStr !== 'string') {
            console.error("Invalid filter target parameter");
            return html;
        }

        // Create a DOM parser to work with the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find all image elements
        const images = doc.querySelectorAll('img');
        
        images.forEach(img => {
            // Check if the image contains the filter target string
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt') || '';
            
            if (src.includes(filterTargetStr) || alt.includes(filterTargetStr)) {
                const replacement = this.#strategyImageFilteringMethod.GetFilteredImage(filterTargetStr);
                
                if (replacement === "") {
                    // Remove the image
                    img.parentNode.removeChild(img);
                } else {
                    // Replace the image with text
                    const textNode = doc.createTextNode(replacement);
                    img.parentNode.replaceChild(textNode, img);
                }
            }
        });
        
        // Convert back to HTML string
        return new XMLSerializer().serializeToString(doc);
    }

    /**
     * Set the image filtering strategy
     * @param {StrategyImageFilteringMethod} strategy - The strategy to use
     */
    SetStrategyImageFilteringMethod(strategy) {
        if (!(strategy instanceof StrategyImageFilteringMethod)) {
            console.error("Strategy must be an instance of StrategyImageFilteringMethod");
            return;
        }
        this.#strategyImageFilteringMethod = strategy;
    }
}