document.addEventListener("DOMContentLoaded", () => {
    const newTaskButton = document.getElementById("newTaskButton");
    const newTaskForm = document.getElementById("newTaskForm");
    const taskNameInput = document.getElementById("taskNameInput");
    const startTaskButton = document.getElementById("startTaskButton");
    const activeTask = document.getElementById("activeTask");
    const activeTaskName = document.getElementById("activeTaskName");
    const timerDisplay = document.getElementById("timer");
    const finishTaskButton = document.getElementById("finishTaskButton");
    const taskTableBody = document.getElementById("taskTableBody");

    const historyDatePicker = document.getElementById("historyDatePicker");
    const viewHistoryButton = document.getElementById("viewHistoryButton");
    const manualTaskName = document.getElementById("manualTaskName");
    const manualTaskTime = document.getElementById("manualTaskTime");
    const manualTaskDate = document.getElementById("manualTaskDate");
    const addManualTaskButton = document.getElementById("addManualTaskButton");

    let timerInterval;
    let startTime;
    let activeTaskData = null;
    let currentDate = getTodayDate();
    // Поточна дата у форматі YYYY-MM-DD, потрібна для прив’язки до задач

    // ======== Утиліти для дати/часу ========
    function getTodayDate() {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${d.getFullYear()}-${month}-${day}`;
    }

    function parseTimeToSeconds(timeStr) {
        // Формат "хх:хх" -> секунди
        const [min, sec] = timeStr.split(":").map(Number);
        return min * 60 + sec;
    }

    function formatSecondsToMinSec(totalSeconds) {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    // ======== Робота з Local Storage ========
    function loadTasks() {
        const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        return allTasks;
    }

    function saveTasks(tasks) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Додаємо новий task-об'єкт у localStorage
    function saveTask(task) {
        const tasks = loadTasks();
        tasks.push(task);
        saveTasks(tasks);
    }

    // Видаляємо task з localStorage
    function deleteTask(taskId) {
        let tasks = loadTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
    }

    // Оновлюємо (редагуємо) task у localStorage
    function updateTask(updatedTask) {
        let tasks = loadTasks();
        tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        saveTasks(tasks);
    }

    // ======== Логіка таймера (активна задача) ========
    function updateTimer() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.textContent = formatSecondsToMinSec(elapsedTime);
    }

    function startTask(name) {
        // Генеруємо унікальний id (просто timestamp)
        const id = Date.now();
        activeTaskData = {
            id: id,
            name: name,
            time: "00:00",
            date: currentDate // Припустимо, що задача створена "сьогодні"
        };

        activeTaskName.textContent = name;
        newTaskForm.classList.add("hidden");
        activeTask.classList.remove("hidden");

        // Запускаємо таймер
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function finishTask() {
        clearInterval(timerInterval);
        const elapsedTime = timerDisplay.textContent;
        activeTaskData.time = elapsedTime;

        // Зберігаємо задачу
        saveTask(activeTaskData);
        // Показуємо у таблиці
        addTaskToTable(activeTaskData);

        // Сховати блок активної задачі
        activeTask.classList.add("hidden");
        activeTaskData = null;
        timerDisplay.textContent = "00:00";
    }

    // ======== Робота з відображенням таблиці ========
    // Один рядок таблиці
    function createTaskRow(task) {
        const row = document.createElement("tr");

        // Стовпець з назвою
        const nameCell = document.createElement("td");
        nameCell.textContent = task.name;
        row.appendChild(nameCell);

        // Стовпець з часом
        const timeCell = document.createElement("td");
        timeCell.textContent = task.time;
        row.appendChild(timeCell);

        // Стовпець з кнопками дій
        const actionCell = document.createElement("td");

        // Кнопка "Продовжити"
        const continueButton = document.createElement("button");
        continueButton.textContent = "Продовжити";
        continueButton.addEventListener("click", () => {
            // Починаємо новий таймер (нова задача),
            // але з тією ж назвою (або за потреби можна додати накопичення часу)
            startTask(task.name);
        });
        actionCell.appendChild(continueButton);

        // Кнопка "Редагувати"
        const editButton = document.createElement("button");
        editButton.textContent = "Редагувати";
        editButton.addEventListener("click", () => {
            editTaskHandler(task, row);
        });
        actionCell.appendChild(editButton);

        // Кнопка "Видалити"
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Видалити";
        deleteButton.addEventListener("click", () => {
            if (confirm(`Видалити задачу "${task.name}"?`)) {
                deleteTask(task.id);
                row.remove();
                updatePieChart(); // Оновлюємо діаграму
            }
        });
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        return row;
    }

    // Додаємо готовий рядок у таблицю
    function addTaskToTable(task) {
        const row = createTaskRow(task);
        taskTableBody.appendChild(row);
    }

    // Очищуємо таблицю і додаємо задачі з масиву
    function renderTasks(tasks) {
        taskTableBody.innerHTML = "";
        tasks.forEach(task => {
            addTaskToTable(task);
        });
    }

    // ======== Обробник Редагування ========
    function editTaskHandler(task, rowElement) {
        // Замінимо назву задачі на <input>, а кнопки - на "Зберегти"
        const nameCell = rowElement.children[0];
        const oldName = task.name;
        const input = document.createElement("input");
        input.value = oldName;
        nameCell.innerHTML = "";
        nameCell.appendChild(input);

        // Дії
        const actionCell = rowElement.children[2];
        const oldActionHTML = actionCell.innerHTML;
        actionCell.innerHTML = "";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Зберегти";
        saveButton.addEventListener("click", () => {
            const newName = input.value.trim();
            if (newName) {
                task.name = newName;
                updateTask(task); // Оновлюємо в localStorage
                nameCell.textContent = newName;
                actionCell.innerHTML = oldActionHTML; // Повертаємо кнопки
                updatePieChart();
            } else {
                alert("Назва задачі не може бути порожньою");
            }
        });

        actionCell.appendChild(saveButton);
    }

    // ======== Історія за обрану дату ========
    function showTasksForDate(dateStr) {
        const allTasks = loadTasks();
        const filteredTasks = allTasks.filter(t => t.date === dateStr);
        renderTasks(filteredTasks);
    }

    // ======== Додавання задачі вручну ========
    function addManualTask() {
        const name = manualTaskName.value.trim();
        const time = manualTaskTime.value.trim(); // "хв:сек"
        const date = manualTaskDate.value || getTodayDate(); // Якщо не вибрано, то сьогодні
        if (!name) {
            alert("Будь ласка, введіть назву задачі.");
            return;
        }
        if (!time.match(/^\d{1,2}:\d{1,2}$/)) {
            alert("Час має бути у форматі 'хв:сек', напр. 10:30");
            return;
        }

        // Генеруємо id
        const id = Date.now();
        const newTask = {
            id,
            name,
            time,
            date
        };

        saveTask(newTask);
        // Якщо зараз на екрані саме ця дата — показуємо відразу
        if (date === historyDatePicker.value) {
            addTaskToTable(newTask);
        }
        updatePieChart();

        // Очищаємо поля форми
        manualTaskName.value = "";
        manualTaskTime.value = "";
        manualTaskDate.value = "";
    }

    // ======== Кругова діаграма з Chart.js ========
    let pieChart; // Глобальна змінна для зберігання екземпляру діаграми
    function updatePieChart() {
        const allTasks = loadTasks();
        // Фільтруємо за обраною датою
        const dateStr = historyDatePicker.value || currentDate;
        const tasksForChart = allTasks.filter(t => t.date === dateStr);

        // Підсумовуємо час по кожній унікальній назві задачі
        const timeMap = {}; // { 'Задача А': 120 (сек.), 'Задача Б': 300 (сек.), ... }
        tasksForChart.forEach(t => {
            if (!timeMap[t.name]) {
                timeMap[t.name] = 0;
            }
            timeMap[t.name] += parseTimeToSeconds(t.time);
        });

        const labels = Object.keys(timeMap);
        const data = Object.values(timeMap);

        // Знищуємо попередню діаграму, якщо існує
        if (pieChart) {
            pieChart.destroy();
        }

        // Створюємо нову діаграму
        const ctx = document.getElementById("timePieChart").getContext("2d");
        pieChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Хвилини",
                        data: data,
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40"
                        ],
                        // Перетворимо секунди на хвилини в Tooltip
                    }
                ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const label = tooltipItem.label;
                                const seconds = tooltipItem.raw;
                                const formatted = formatSecondsToMinSec(seconds);
                                return `${label}: ${formatted} (хв:сек)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ======== Обробники подій ========
    newTaskButton.addEventListener("click", () => {
        newTaskForm.classList.remove("hidden");
    });

    startTaskButton.addEventListener("click", () => {
        const taskName = taskNameInput.value.trim();
        if (taskName) {
            taskNameInput.value = "";
            startTask(taskName);
        }
    });

    finishTaskButton.addEventListener("click", finishTask);

    viewHistoryButton.addEventListener("click", () => {
        const selectedDate = historyDatePicker.value;
        if (!selectedDate) {
            alert("Оберіть дату для перегляду історії.");
            return;
        }
        showTasksForDate(selectedDate);
        updatePieChart();
    });

    addManualTaskButton.addEventListener("click", addManualTask);

    // ======== Ініціалізація на старті ========
    // Встановимо сьогоднішню дату у календар
    historyDatePicker.value = currentDate;
    showTasksForDate(currentDate);

    // Малюємо діаграму на поточну дату
    updatePieChart();
});
