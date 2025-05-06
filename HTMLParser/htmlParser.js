// htmlParser.js
import { isNewWord, isNewImage } from "./ParserHandler.js";

export function extractNewWordsFromText(text) {
    const words = text.trim().split(/\s+/);
    words.forEach(word => {
        const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, "");
        if (
            cleanWord &&
            !/^\d+$/.test(cleanWord) &&
            isNewWord(cleanWord)
        ) {
            console.log("[새 단어]", cleanWord);
        }
    });
}

export function extractImagesFromNode(node) {
    if (node.nodeName === "IMG") {
        const src = node.src;
        if (src && isNewImage(src)) {
            console.log("[이미지 URL]", src);
        }
    }

    node.querySelectorAll?.("img").forEach(img => {
        const src = img.src;
        if (src && isNewImage(src)) {
            console.log("[이미지 URL]", src);
        }
    });
}

export function extractTextFromNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        const style = window.getComputedStyle(parent);
        const isVisible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0";

        if (isVisible) {
            const text = node.nodeValue.trim();
            if (text.length > 0) {
                extractNewWordsFromText(text);
            }
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (!["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)) {
            extractImagesFromNode(node);
            node.childNodes.forEach(child => extractTextFromNode(child));
        }
    }
}
