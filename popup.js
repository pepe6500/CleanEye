// UI
const harmSlider = document.getElementById("harmLevel");
const harmValueText = document.getElementById("harmLevelValue");
const harmLevelText = document.getElementById("harmLevelText");

function updateHarmDisplay(value) {
    harmValueText.textContent = value;
    // 색상 및 텍스트 조절
    if (value <= 33) {
        harmLevelText.textContent = "낮음";
        harmLevelText.className = "level-low";
    } else if (value <= 66) {
        harmLevelText.textContent = "보통";
        harmLevelText.className = "level-medium";
    } else {
        harmLevelText.textContent = "높음";
        harmLevelText.className = "level-high";
    }
}

harmSlider.addEventListener("input", function () {
    const value = parseInt(this.value, 10);
    updateHarmDisplay(value);
    chrome.storage.local.set({ harmLevel: value });  // 이제 정상 작동
});

// 팝업이 열릴 때: 저장된 슬라이더 값 로드
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["harmLevel"], (result) => {
        const savedValue = result.harmLevel ?? 50; // 기본값 50
        harmSlider.value = savedValue;
        updateHarmDisplay(savedValue);
    });
});
