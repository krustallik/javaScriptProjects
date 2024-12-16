// Годинник
const clockElement = document.getElementById("clock");

function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const timeString = now.toTimeString().split(" ")[0];

    clockElement.textContent = `[ ${timeString} ]`;
    const rotation = seconds * 6; // 360° / 60 = 6° per second
    clockElement.style.transform = `rotate(${rotation}deg)`;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call

// Ефект набору тексту
const inputText = document.getElementById("inputText");
const updateTextButton = document.getElementById("updateText");
const outputElement = document.getElementById("output");

let intervalId = null;
let currentIndex = 0;
let text = "";

function startTypingEffect(newText) {
    clearInterval(intervalId);
    currentIndex = 0;
    text = newText;

    intervalId = setInterval(() => {
        if (currentIndex < text.length) {
            outputElement.textContent += text[currentIndex];
            currentIndex++;
        } else {
            setTimeout(() => {
                outputElement.textContent = "";
                currentIndex = 0;
            }, 1000); // Затримка перед стиранням тексту
        }
    }, 1000);
}

updateTextButton.addEventListener("click", () => {
    const newText = inputText.value.trim();
    if (newText) {
        outputElement.textContent = ""; // Очищення перед новим текстом
        startTypingEffect(newText);
    }
});
