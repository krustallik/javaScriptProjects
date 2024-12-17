// Завдання 1: Коло
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("circle")) {
        // Якщо це червоне коло, зробити його зеленим
        if (event.target.style.backgroundColor === "red") {
            event.target.style.backgroundColor = "green";
        }
        // Якщо це зелене коло, видалити його
        else if (event.target.style.backgroundColor === "green") {
            event.target.remove();
        }
    } else {
        // Створення червоного кола на кліку
        const circle = document.createElement("div");
        circle.classList.add("circle");
        circle.style.left = `${event.clientX - 25}px`;
        circle.style.top = `${event.clientY - 25}px`;
        circle.style.backgroundColor = "red";
        document.body.appendChild(circle);
    }
});


// Завдання 2: Кнопка, яка тікає
const runawayButton = document.getElementById("runawayButton");
runawayButton.addEventListener("mousemove", () => {
    const maxWidth = window.innerWidth - runawayButton.offsetWidth;
    const maxHeight = window.innerHeight - runawayButton.offsetHeight;
    const newX = Math.random() * maxWidth;
    const newY = Math.random() * maxHeight;

    runawayButton.style.left = `${newX}px`;
    runawayButton.style.top = `${newY}px`;
});

// Завдання 3: Рух елемента за допомогою стрілок
const movableElement = document.getElementById("movableElement");
let positionX = window.innerWidth / 2 - 25;
let positionY = window.innerHeight / 2 - 25;

function moveElement(event) {
    const step = 10;

    switch (event.key) {
        case "ArrowUp":
            if (positionY > 0) positionY -= step;
            break;
        case "ArrowDown":
            if (positionY < window.innerHeight - movableElement.offsetHeight) positionY += step;
            break;
        case "ArrowLeft":
            if (positionX > 0) positionX -= step;
            break;
        case "ArrowRight":
            if (positionX < window.innerWidth - movableElement.offsetWidth) positionX += step;
            break;
        case "Enter":
            movableElement.style.backgroundColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            break;
    }

    movableElement.style.left = `${positionX}px`;
    movableElement.style.top = `${positionY}px`;
}

document.addEventListener("keydown", moveElement);
