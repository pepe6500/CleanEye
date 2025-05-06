// ParserHandler.js
const knownWords = new Set();
const knownImages = new Set();

export function isNewWord(word) {
    if (!knownWords.has(word)) {
        knownWords.add(word);
        return true;
    }
    return false;
}

export function isNewImage(src) {
    if (!knownImages.has(src)) {
        knownImages.add(src);
        return true;
    }
    return false;
}