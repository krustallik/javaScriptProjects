// js/editor.js

// Глобальні змінні в контексті редактора
let tests = [];
let currentTestId = null;

// 1. При завантаженні сторінки – зчитуємо тести
window.onload = function() {
    tests = loadTestsFromStorage();
    renderTestList();
};

// 2. Відмалюємо список тестів
function renderTestList() {
    const testListEl = document.getElementById('testList');
    testListEl.innerHTML = '';

    tests.forEach((test, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
      <strong>${test.name}</strong>
      <div class="actions">
        <button class="btn" onclick="editTest(${index})">Редагувати</button>
        <button class="btn" onclick="deleteTest(${index})">Видалити</button>
      </div>
    `;
        testListEl.appendChild(li);
    });
}

// 3. Створення нового тесту
function createTest() {
    const newTestNameEl = document.getElementById('newTestName');
    const testName = newTestNameEl.value.trim();
    if (!testName) {
        alert('Введіть назву нового тесту!');
        return;
    }

    const newTest = {
        name: testName,
        questions: []
    };

    tests.push(newTest);
    saveTestsToStorage(tests);
    renderTestList();
    newTestNameEl.value = '';
}

// 4. Редагування обраного тесту
function editTest(index) {
    currentTestId = index;
    const test = tests[currentTestId];

    // Відобразити редактор
    document.getElementById('testEditor').classList.remove('hide');

    // Заповнити поля
    document.getElementById('editTestName').value = test.name;

    renderQuestions();
}

// 5. Зберегти нову назву тесту
function updateTestName() {
    const newName = document.getElementById('editTestName').value.trim();
    if (!newName) {
        alert('Назва тесту не може бути пустою!');
        return;
    }

    tests[currentTestId].name = newName;
    saveTestsToStorage(tests);
    renderTestList();
    renderQuestions();
}

// 6. Закрити редактор
function closeEditor() {
    currentTestId = null;
    document.getElementById('testEditor').classList.add('hide');
}

// 7. Видалити тест
function deleteTest(index) {
    if (!confirm('Ви дійсно хочете видалити цей тест?')) return;
    tests.splice(index, 1);
    saveTestsToStorage(tests);
    renderTestList();
}

// 8. Додати питання
function addQuestion() {
    const questionText = document.getElementById('newQuestionText').value.trim();
    if (!questionText) {
        alert('Введіть текст питання!');
        return;
    }

    tests[currentTestId].questions.push({
        text: questionText,
        answers: []
    });
    saveTestsToStorage(tests);
    renderQuestions();
    document.getElementById('newQuestionText').value = '';
}

// 9. Відмалювати питання
function renderQuestions() {
    const questionListEl = document.getElementById('questionList');
    questionListEl.innerHTML = '';
    const test = tests[currentTestId];

    test.questions.forEach((question, qIndex) => {
        const li = document.createElement('li');

        let answersHTML = '';
        question.answers.forEach((answer, aIndex) => {
            answersHTML += `
        <li>
          <div class="flex-inline">
            <input type="checkbox" ${answer.correct ? 'checked' : ''} onchange="toggleAnswerCorrect(${qIndex}, ${aIndex}, this)">
            <input type="text" value="${answer.text}" onblur="updateAnswerText(${qIndex}, ${aIndex}, this)">
          </div>
          <div class="actions">
            <button class="btn" onclick="deleteAnswer(${qIndex}, ${aIndex})">Видалити</button>
          </div>
        </li>
      `;
        });

        li.innerHTML = `
      <div>
        <label>Текст питання:</label>
        <input type="text" value="${question.text}" onblur="updateQuestionText(${qIndex}, this)">
      </div>
      <div>
        <label>Варіанти відповідей:</label>
        <ul class="answers">${answersHTML}</ul>
        <div>
          <button class="btn" onclick="addAnswer(${qIndex})">Додати варіант</button>
        </div>
      </div>
      <div class="actions">
        <button class="btn" onclick="deleteQuestion(${qIndex})">Видалити питання</button>
      </div>
    `;

        questionListEl.appendChild(li);
    });
}

// 10. Оновити текст питання
function updateQuestionText(qIndex, inputEl) {
    const newText = inputEl.value.trim();
    tests[currentTestId].questions[qIndex].text = newText;
    saveTestsToStorage(tests);
}

// 11. Видалити питання
function deleteQuestion(qIndex) {
    if (!confirm('Ви дійсно хочете видалити це питання?')) return;
    tests[currentTestId].questions.splice(qIndex, 1);
    saveTestsToStorage(tests);
    renderQuestions();
}

// 12. Додати варіант відповіді
function addAnswer(qIndex) {
    tests[currentTestId].questions[qIndex].answers.push({
        text: 'Новий варіант',
        correct: false
    });
    saveTestsToStorage(tests);
    renderQuestions();
}

// 13. Оновити текст варіанту
function updateAnswerText(qIndex, aIndex, inputEl) {
    const newText = inputEl.value.trim();
    tests[currentTestId].questions[qIndex].answers[aIndex].text = newText;
    saveTestsToStorage(tests);
}

// 14. Перемкнути правильність варіанту
function toggleAnswerCorrect(qIndex, aIndex, checkbox) {
    tests[currentTestId].questions[qIndex].answers[aIndex].correct = checkbox.checked;
    saveTestsToStorage(tests);
}

// 15. Видалити варіант відповіді
function deleteAnswer(qIndex, aIndex) {
    tests[currentTestId].questions[qIndex].answers.splice(aIndex, 1);
    saveTestsToStorage(tests);
    renderQuestions();
}

// 16. Експорт
function exportTest() {
    if (currentTestId === null) {
        alert('Спочатку оберіть тест!');
        return;
    }
    const testData = tests[currentTestId];
    const fileName = (testData.name || 'test') + '.json';
    const jsonStr = JSON.stringify(testData, null, 2);

    const blob = new Blob([jsonStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
}

// 17. Імпорт
function importTest(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            tests.push(importedData);
            saveTestsToStorage(tests);
            renderTestList();
            alert('Тест успішно імпортовано!');
        } catch (err) {
            alert('Помилка при зчитуванні файлу. Перевірте формат JSON.');
        }
    };
    reader.readAsText(file);

    // Очищаємо значення поля, щоб можна було завантажити той самий файл повторно
    input.value = '';
}
