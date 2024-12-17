const ratingContainer = document.getElementById("rating");
const feedbackFields = document.getElementById("feedback-fields");
const reviewText = document.getElementById("review-text");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const agreeCheckbox = document.getElementById("agree");
const submitBtn = document.getElementById("submit-btn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const modalData = document.getElementById("modal-data");

let selectedRating = 0;

// Створення зірок
for (let i = 1; i <= 10; i++) {
    const star = document.createElement("span");
    star.classList.add("star");
    star.innerHTML = "★";
    star.dataset.value = i;
    ratingContainer.appendChild(star);
}

const stars = document.querySelectorAll(".star");

// Подія для вибору оцінки
stars.forEach((star) => {
    star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value);
        updateStars();
        feedbackFields.classList.remove("hidden"); // Показати поля
        validateForm();
    });
});

function updateStars() {
    stars.forEach((star) => {
        star.classList.toggle("selected", star.dataset.value <= selectedRating);
    });
}

// Валідація полів
function validateForm() {
    let isValid = true;

    if (!reviewText.value.trim()) isValid = false;
    if (!/^[a-zA-Zа-яА-ЯіІїЇєЄ]+$/.test(nameInput.value)) isValid = false;
    if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) isValid = false;
    if (!agreeCheckbox.checked) isValid = false;

    submitBtn.disabled = !(selectedRating && isValid);
    submitBtn.classList.toggle("active", !submitBtn.disabled);
}

[reviewText, nameInput, emailInput, agreeCheckbox].forEach((input) =>
    input.addEventListener("input", validateForm)
);

// Обробник кнопки
submitBtn.addEventListener("click", () => {
    modalData.innerHTML = `
    Оцінка: ${selectedRating}<br>
    Відгук: ${reviewText.value}<br>
    Ім'я: ${nameInput.value}<br>
    Email: ${emailInput.value}
  `;
    modal.style.display = "flex";
});

// Закриття модального вікна
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    resetForm();
});

function resetForm() {
    selectedRating = 0;
    updateStars();
    feedbackFields.classList.add("hidden");
    reviewText.value = "";
    nameInput.value = "";
    emailInput.value = "";
    agreeCheckbox.checked = false;
    validateForm();
}
