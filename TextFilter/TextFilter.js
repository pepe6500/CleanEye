import Filter from "../Filter.js";
import StrategyTextFilteringMethod from "./StrategyTextFilteringMethod.js";
import StrategeTextReplace from "./StrategeTextReplace.js";

export default class TextFilter extends Filter {
    /**
     * @private
     * @type {StrategyTextFilteringMethod}
     */
    #strategyTextFilteringMethod;

    /**
     * Create a new TextFilter with default strategy
     */
    constructor() {
        super();
        // Default to replace strategy
        this.#strategyTextFilteringMethod = new StrategeTextReplace();
    }

    /**
     * Set the text filtering strategy
     * @param {StrategyTextFilteringMethod} strategy - The strategy to use
     */
    SetStrategyTextFilteringMethod(strategy) {
        if (!(strategy instanceof StrategyTextFilteringMethod)) {
            console.error("Strategy must be an instance of StrategyTextFilteringMethod");
            return;
        }
        this.#strategyTextFilteringMethod = strategy;
    }

    /**
     * Filter HTML content by applying the current strategy to text nodes
     * @param {string} html - The HTML content to filter
     * @param {string} filterTargetStr - The target string to identify text to filter
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
        
        // Function to recursively process text nodes
        const processNode = (node) => {
            // Process text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.includes(filterTargetStr)) {
                    const replacement = this.#strategyTextFilteringMethod.GetFilteredText(filterTargetStr);
                    // Replace all occurrences of the target string with the filtered text
                    node.textContent = node.textContent.replace(
                        new RegExp(filterTargetStr, 'g'), 
                        replacement
                    );
                }
            } 
            // Process element nodes recursively
            else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip script and style elements
                if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                    // Process attributes that might contain text
                    for (const attr of node.attributes) {
                        if (attr.value.includes(filterTargetStr)) {
                            const replacement = this.#strategyTextFilteringMethod.GetFilteredText(filterTargetStr);
                            attr.value = attr.value.replace(
                                new RegExp(filterTargetStr, 'g'), 
                                replacement
                            );
                        }
                    }
                    
                    // Process child nodes
                    Array.from(node.childNodes).forEach(child => {
                        processNode(child);
                    });
                }
            }
        };
        
        // Start processing from the body
        processNode(doc.body);
        
        // Convert back to HTML string
        return new XMLSerializer().serializeToString(doc);
    }
}

// Usage example:
// const textFilter = new TextFilter();
// 
// // Use replace strategy (default)
// let filteredHtml = textFilter.GetFilteredCode('<p>This contains bad words like badword</p>', 'badword');
// 
// // Switch to remove strategy
// textFilter.SetStrategyTextFilteringMethod(new StrategeTextRemove());
// filteredHtml = textFilter.GetFilteredCode('<p>This contains bad words like badword</p>', 'badword');
// 
// // Custom replace text
// textFilter.SetStrategyTextFilteringMethod(new StrategeTextReplace("[CENSORED]"));
// filteredHtml = textFilter.GetFilteredCode('<p>This contains bad words like badword</p>', 'badword');