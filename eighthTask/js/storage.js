// js/storage.js

// Ключ, за яким зберігатимемо тести в localStorage
const TESTS_KEY = 'tests';

// Функція зчитування тестів із localStorage
function loadTestsFromStorage() {
    const data = localStorage.getItem(TESTS_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

// Функція збереження масиву тестів у localStorage
function saveTestsToStorage(tests) {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
}
