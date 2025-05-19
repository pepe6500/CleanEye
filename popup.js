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



// 검열 방식 선택
const censorSelect = document.getElementById("censorSelect");
const exampleOutput = document.getElementById("exampleOutput");

const original = '이건 진짜 나쁜놈이야!';
const badWord = '나쁜놈';

function updateExample() {
    const method = censorSelect.value;
    let censored = '';

    switch (method) {
        case 'asterisks':
            censored = original.replace(badWord, '***');
            break;
        case 'strikethrough':
            censored = original.replace(badWord, `<s>${badWord}</s>`);
            break;
        case 'AI':
            censored = original.replace(badWord, '나쁜 사람');
            break;
        case 'blur':
            censored = original.replace(badWord, `<span class="blurred">${badWord}</span>`);
            break;
    }

    exampleOutput.innerHTML = `예시: ${censored}`;
}

censorSelect.addEventListener("change", () => {
    const selectedMethod = censorSelect.value;
    chrome.storage.local.set({ censorMethod: selectedMethod });
    updateExample();
});


document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["censorMethod"], (result) => {
        const savedMethod = result.censorMethod ?? 'asterisks';
        censorSelect.value = savedMethod;
        updateExample(); 
    });
});
////

// 이미지 필터링 방식 저장
const imageFilterSelect = document.getElementById("imageFilterSelect");

imageFilterSelect.addEventListener("change", () => {
  const selectedImageFilter = imageFilterSelect.value;
  chrome.storage.local.set({ imageFilterMethod: selectedImageFilter });
});

// 팝업 열릴 때 불러오기
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["imageFilterMethod"], (result) => {
    const savedImageMethod = result.imageFilterMethod ?? "mosaic";
    imageFilterSelect.value = savedImageMethod;
  });
});