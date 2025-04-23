
/**
 * FilteringHandler class for coordinating text and image filtering operations
 */

import ImageFilter from "./ImageFilter/ImageFilter.js";
import StrategeTextRemove from "./TextFilter/StrategeTextRemove.js";
import StrategeTextReplace from "./TextFilter/StrategeTextReplace.js";
import TextFilter from "./TextFilter/TextFilter.js";
import StrategeImageRemove from "./ImageFilter/StrategeImageRemove.js";
import StrategeImageReplace from "./ImageFilter/StrategeImageReplace.js";
import UserSettingManager from "./UserSettingManager.js";

class FilteringHandler {
    /**
     * @private
     * @type {ImageFilter}
     */
    #imageFilter;

    /**
     * @private
     * @type {TextFilter}
     */
    #textFilter;

    /**
     * @private
     * @type {UserSettingManager}
     */
    #userSettingManager;

    /**
     * Create a new FilteringHandler
     * @param {UserSettingManager} userSettingManager - The user setting manager
     */
    constructor(userSettingManager) {
        this.#userSettingManager = userSettingManager;
        this.#textFilter = new TextFilter();
        this.#imageFilter = new ImageFilter();
    }

    /**
     * Initialize the filtering handler
     */
    Init() {
        // Initialize filters based on current user settings
        this.UpdateTextFilteringMethod();
        this.UpdateImageFilteringMethod();
        
        // Initialize event handlers
        this.InitEvents();
        
        console.log("FilteringHandler initialized");
    }

    /**
     * Initialize event handlers
     */
    InitEvents() {
        // Add settings event listener
        this.#userSettingManager.AddUpdateSettingValueEvent(this.HandleOnUpdateSettingValue.bind(this));
        
        console.log("FilteringHandler events initialized");
    }

    /**
     * Update text filtering method based on user settings
     */
    UpdateTextFilteringMethod() {
        const textFilterType = this.#userSettingManager.GetValue('textFilterType') || 'replace';
        const textReplacement = this.#userSettingManager.GetValue('textReplacement') || '***';
        
        if (textFilterType === 'remove') {
            this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextRemove());
        } else {
            this.#textFilter.SetStrategyTextFilteringMethod(new StrategeTextReplace(textReplacement));
        }
        
        console.log(`Text filtering method updated to: ${textFilterType}`);
    }

    /**
     * Update image filtering method based on user settings
     */
    UpdateImageFilteringMethod() {
        const imageFilterType = this.#userSettingManager.GetValue('imageFilterType') || 'replace';
        const imageReplacement = this.#userSettingManager.GetValue('imageReplacement') || '[Image Filtered]';
        
        if (imageFilterType === 'remove') {
            this.#imageFilter.SetStrategyImageFilteringMethod(new StrategeImageRemove());
        } else {
            this.#imageFilter.SetStrategyImageFilteringMethod(new StrategeImageReplace(imageReplacement));
        }
        
        console.log(`Image filtering method updated to: ${imageFilterType}`);
    }

    /**
     * Handle text filter server-to-client response
     * @param {string[]} filteredText - The filtered text from the server
     */
    
    async HandleOnTextFilterSTC(originPagehtml, filteredText) {
        let result = originPagehtml;
        console.error("s " + result);
        filteredText.forEach(filter => {
            if (filter.trim()) {
                result = this.#textFilter.GetFilteredCode(result, filter);
            }
        });
        console.error("e " + result);
        document.body.innerHTML = result;
    }

    /**
     * Handle image filter server-to-client response
     * @param {string} filteredImageURL - The filtered image URL from the server
     * @param {number} statusCode - The status code from the server
     */
    HandleOnImageFilterSTC(filteredImageURL, statusCode) {
        if (statusCode !== 200) {
            console.error(`Image filtering failed with status code: ${statusCode}`);
            return;
        }
        
        // Apply additional client-side filtering if needed
        const additionalFilters = this.#userSettingManager.GetValue('additionalImageFilters');
        if (additionalFilters) {
            const filterList = additionalFilters.split(',');
            let result = `<img src="${filteredImageURL}" alt="Filtered Image">`;
            
            filterList.forEach(filter => {
                if (filter.trim()) {
                    result = this.#imageFilter.GetFilteredCode(result, filter.trim());
                }
            });
            
            // Update the DOM or notify the application with the filtered result
            console.log("Image filtered:", result);
            
            // Here you would typically update the UI with the filtered content
            document.getElementById('imageContainer').innerHTML = result;
        } else {
            console.log("Image filtered:", filteredImageURL);
            // Update the UI with the filtered image from the server
        }
    }

    /**
     * Handle setting value updates
     * @param {string} key - The setting key that was updated
     * @param {string} value - The new setting value
     */
    HandleOnUpdateSettingValue(key, value) {
        console.log(`Setting updated: ${key} = ${value}`);
        
        // Update filtering methods if relevant settings changed
        if (['textFilterType', 'textReplacement'].includes(key)) {
            this.UpdateTextFilteringMethod();
        } else if (['imageFilterType', 'imageReplacement'].includes(key)) {
            this.UpdateImageFilteringMethod();
        }
        
        // Refresh content if needed
        if (['additionalTextFilters', 'additionalImageFilters'].includes(key)) {
            console.log("Refreshing content due to filter changes");
            // Here you would typically trigger a refresh of the filtered content
        }
    }

    /**
     * Handle cleanup when the application is closing
     * @param {Event} event - The beforeunload event
     */
    HandleOnExit(event) {
        // Remove event listeners
        this.#userSettingManager.RemoveUpdateSettingValueEvent(this.HandleOnUpdateSettingValue);
        
        // Save any pending settings
        // this.#userSettingManager.SaveSettings(); // If implemented
        
        console.log("FilteringHandler cleaned up");
    }
}

const userSettingManager = new UserSettingManager();

const filteringHandler = new FilteringHandler(userSettingManager);
filteringHandler.Init();

main (html, result)
{
    filteringHandler.HandleOnTextFilterSTC(html, result)
}