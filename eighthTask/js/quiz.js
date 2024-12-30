// js/quiz.js

let tests = [];
let selectedTest = null;      // Обраний користувачем тест
let currentQuestionIndex = 0; // Поточне питання
let studentName = '';         // Ім'я студента
let userAnswers = [];         // Відповіді користувача
let totalTime = 0;            // Загальний час тестування (секунди)
let questionTime = 30;        // 30 секунд на 1 питання
let timerInterval = null;     // для setInterval

// Елементи DOM
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');

const studentNameInput = document.getElementById('studentName');
const testSelect = document.getElementById('testSelect');
const startBtn = document.getElementById('startBtn');

const testTitleEl = document.getElementById('testTitle');
const studentLabelEl = document.getElementById('studentLabel');
const questionContainer = document.getElementById('questionContainer');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const timerValueEl = document.getElementById('timerValue');

const resultNameEl = document.getElementById('resultName');
const resultTimeEl = document.getElementById('resultTime');
const resultScoreEl = document.getElementById('resultScore');
const retryBtn = document.getElementById('retryBtn');

// Події
window.onload = function() {
    tests = loadTestsFromStorage();
    renderTestOptions();
};

studentNameInput.addEventListener('input', checkIfCanStart);
testSelect.addEventListener('change', checkIfCanStart);
startBtn.addEventListener('click', startTest);

prevBtn.addEventListener('click', function() {
    if (currentQuestionIndex > 0) {
        saveCurrentAnswer();
        currentQuestionIndex--;
        renderQuestion();
        resetTimer();
    }
});

nextBtn.addEventListener('click', function() {
    const totalQuestions = selectedTest.questions.length;
    if (currentQuestionIndex === totalQuestions - 1) {
        endTest();
    } else {
        saveCurrentAnswer();
        currentQuestionIndex++;
        renderQuestion();
        resetTimer();
    }
});

retryBtn.addEventListener('click', resetAll);

// Функції
function renderTestOptions() {
    testSelect.innerHTML = '';
    if (tests.length === 0) {
        const noOption = document.createElement('option');
        noOption.textContent = 'Немає доступних тестів';
        noOption.value = '';
        testSelect.appendChild(noOption);
        return;
    }

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Оберіть тест...';
    defaultOption.value = '';
    testSelect.appendChild(defaultOption);

    tests.forEach((test, idx) => {
        const option = document.createElement('option');
        option.textContent = test.name;
        option.value = idx;
        testSelect.appendChild(option);
    });
}

function checkIfCanStart() {
    studentName = studentNameInput.value.trim();
    const testValue = testSelect.value;
    startBtn.disabled = !(studentName !== '' && testValue !== '');
}

function startTest() {
    selectedTest = tests[testSelect.value];
    startScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    resultScreen.classList.add('hide');

    testTitleEl.textContent = selectedTest.name;
    studentLabelEl.textContent = studentName;

    userAnswers = Array(selectedTest.questions.length).fill(null);
    currentQuestionIndex = 0;
    totalTime = 0;
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    const questionData = selectedTest.questions[currentQuestionIndex];
    const totalQuestions = selectedTest.questions.length;

    questionContainer.innerHTML = '';

    // Рахуємо кількість правильних відповідей (для визначення radio/checkbox)
    const correctAnswersCount = questionData.answers.filter(a => a.correct).length;

    const qBlock = document.createElement('div');
    qBlock.classList.add('question-block');
    qBlock.innerHTML = `
    <h3>Питання ${currentQuestionIndex + 1} із ${totalQuestions}</h3>
    <p>${questionData.text}</p>
  `;
    questionContainer.appendChild(qBlock);

    // Виводимо варіанти
    questionData.answers.forEach((answer, idx) => {
        const answerDiv = document.createElement('div');
        answerDiv.classList.add('answer-option');

        let inputType = (correctAnswersCount > 1) ? 'checkbox' : 'radio';

        const userAnswerValue = userAnswers[currentQuestionIndex];
        let isChecked = false;
        if (Array.isArray(userAnswerValue)) {
            isChecked = userAnswerValue.includes(idx);
        } else {
            isChecked = (userAnswerValue === idx);
        }

        answerDiv.innerHTML = `
      <label>
        <input 
          type="${inputType}" 
          name="answerGroup" 
          value="${idx}" 
          ${isChecked ? 'checked' : ''}>
        ${answer.text}
      </label>
    `;

        questionContainer.appendChild(answerDiv);
    });

    // Кнопка "Назад"
    if (currentQuestionIndex === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'inline-block';
    }

    // Кнопка "Далі" / "Завершити"
    if (currentQuestionIndex === totalQuestions - 1) {
        nextBtn.textContent = 'Завершити тестування';
    } else {
        nextBtn.textContent = 'Далі';
    }
}

function saveCurrentAnswer() {
    const questionData = selectedTest.questions[currentQuestionIndex];
    const correctAnswersCount = questionData.answers.filter(a => a.correct).length;
    const answerInputs = document.querySelectorAll('input[name="answerGroup"]');

    if (correctAnswersCount > 1) {
        const checkedIndexes = [];
        answerInputs.forEach(input => {
            if (input.checked) {
                checkedIndexes.push(parseInt(input.value));
            }
        });
        userAnswers[currentQuestionIndex] = checkedIndexes;
    } else {
        let selectedIndex = null;
        answerInputs.forEach(input => {
            if (input.checked) {
                selectedIndex = parseInt(input.value);
            }
        });
        userAnswers[currentQuestionIndex] = selectedIndex;
    }
}

function startTimer() {
    questionTime = 30;
    timerValueEl.textContent = questionTime;

    timerInterval = setInterval(() => {
        questionTime--;
        totalTime++;
        timerValueEl.textContent = questionTime;

        if (questionTime <= 0) {
            endTest();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    startTimer();
}

function endTest() {
    clearInterval(timerInterval);
    saveCurrentAnswer();

    startScreen.classList.add('hide');
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');

    let correctCount = 0;

    selectedTest.questions.forEach((q, qIdx) => {
        const correctAnswersForQ = q.answers
            .map((ans, i) => ans.correct ? i : -1)
            .filter(i => i !== -1);

        const userAnswer = userAnswers[qIdx] || [];

        // Якщо кілька правильних
        if (correctAnswersForQ.length > 1) {
            if (arraysEqual(correctAnswersForQ, userAnswer)) {
                correctCount++;
            }
        } else {
            // Якщо одна правильна
            if (correctAnswersForQ[0] === userAnswer) {
                correctCount++;
            }
        }
    });

    const totalQuestions = selectedTest.questions.length;
    const scorePercent = ((correctCount / totalQuestions) * 100).toFixed(2);

    resultNameEl.textContent = studentName;
    resultTimeEl.textContent = totalTime;
    resultScoreEl.textContent = scorePercent;
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    arr1 = arr1.slice().sort();
    arr2 = arr2.slice().sort();
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function resetAll() {
    clearInterval(timerInterval);
    studentNameInput.value = '';
    testSelect.value = '';
    startBtn.disabled = true;

    startScreen.classList.remove('hide');
    quizScreen.classList.add('hide');
    resultScreen.classList.add('hide');

    selectedTest = null;
    userAnswers = [];
    currentQuestionIndex = 0;
    totalTime = 0;
}
