document.addEventListener("DOMContentLoaded", () => {
    // Елементи DOM
    const authSection = document.getElementById("authSection");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const registerName = document.getElementById("registerName");
    const registerEmail = document.getElementById("registerEmail");
    const registerPassword = document.getElementById("registerPassword");
    const loginError = document.getElementById("loginError");
    const registerError = document.getElementById("registerError");

    const userSection = document.getElementById("userSection");
    const currentUserSpan = document.getElementById("currentUser");
    const logoutButton = document.getElementById("logoutButton");

    const newProjectName = document.getElementById("newProjectName");
    const addProjectButton = document.getElementById("addProjectButton");
    const projectList = document.getElementById("projectList");

    const newTaskButton = document.getElementById("newTaskButton");
    const newTaskForm = document.getElementById("newTaskForm");
    const taskNameInput = document.getElementById("taskNameInput");
    const taskProjectSelect = document.getElementById("taskProjectSelect");
    const startTaskButton = document.getElementById("startTaskButton");
    const activeTask = document.getElementById("activeTask");
    const activeTaskName = document.getElementById("activeTaskName");
    const activeTaskProject = document.getElementById("activeTaskProject");
    const timerDisplay = document.getElementById("timer");
    const finishTaskButton = document.getElementById("finishTaskButton");
    const taskTableBody = document.getElementById("taskTableBody");

    const historyDatePicker = document.getElementById("historyDatePicker");
    const viewHistoryButton = document.getElementById("viewHistoryButton");
    const manualTaskName = document.getElementById("manualTaskName");
    const manualTaskProject = document.getElementById("manualTaskProject");
    const manualTaskTime = document.getElementById("manualTaskTime");
    const manualTaskDate = document.getElementById("manualTaskDate");
    const addManualTaskButton = document.getElementById("addManualTaskButton");
    const manualTaskError = document.getElementById("manualTaskError");

    // Перемінні
    let timerInterval;
    let startTime;
    let activeTaskData = null;
    let currentDate = getTodayDate();
    let currentUser = null;
    let pieChart;

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
    function loadUsers() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        return users;
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    function findUserByEmail(email) {
        const users = loadUsers();
        return users.find(user => user.email === email);
    }

    function registerUser(name, email, password) {
        const users = loadUsers();
        const hashedPassword = CryptoJS.SHA256(password).toString();
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            projects: [], // Користувацькі проєкти
            tasks: [] // Користувацькі задачі
        };
        users.push(newUser);
        saveUsers(users);
    }

    function loginUser(email, password) {
        const user = findUserByEmail(email);
        if (user) {
            const hashedPassword = CryptoJS.SHA256(password).toString();
            if (user.password === hashedPassword) {
                return user;
            }
        }
        return null;
    }

    function saveCurrentUser(user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
    }

    function getCurrentUser() {
        return JSON.parse(localStorage.getItem("currentUser"));
    }

    function logoutCurrentUser() {
        localStorage.removeItem("currentUser");
    }

    // ======== Функції для проектів ========
    function loadProjects() {
        return currentUser.projects || [];
    }

    function saveProjects(projects) {
        currentUser.projects = projects;
        updateCurrentUser();
    }

    function addProject(name) {
        const projects = loadProjects();
        const newProject = {
            id: Date.now(),
            name
        };
        projects.push(newProject);
        saveProjects(projects);
        renderProjectList();
        populateProjectSelect();
    }

    function deleteProject(projectId) {
        let projects = loadProjects();
        projects = projects.filter(p => p.id !== projectId);
        saveProjects(projects);
        renderProjectList();
        populateProjectSelect();
        // Також видаляємо проєкту з задач, які до нього відносяться
        let tasks = loadTasks();
        tasks = tasks.map(task => {
            if (task.projectId === projectId) {
                task.projectId = null;
            }
            return task;
        });
        saveTasks(tasks);
        showTasksForDate(historyDatePicker.value || currentDate);
        updatePieChart();
    }

    function editProject(projectId, newName) {
        const projects = loadProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
            project.name = newName;
            saveProjects(projects);
            renderProjectList();
            populateProjectSelect();
            showTasksForDate(historyDatePicker.value || currentDate);
            updatePieChart();
        }
    }

    function renderProjectList() {
        projectList.innerHTML = "";
        const projects = loadProjects();
        projects.forEach(project => {
            const li = document.createElement("li");
            li.textContent = project.name;

            const actionsDiv = document.createElement("div");

            // Кнопка "Редагувати"
            const editButton = document.createElement("button");
            editButton.textContent = "Редагувати";
            editButton.addEventListener("click", () => {
                const newName = prompt("Введіть нову назву проєкту:", project.name);
                if (newName && newName.trim() !== "") {
                    editProject(project.id, newName.trim());
                }
            });
            actionsDiv.appendChild(editButton);

            // Кнопка "Видалити"
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Видалити";
            deleteButton.style.backgroundColor = "#dc3545";
            deleteButton.addEventListener("click", () => {
                if (confirm(`Видалити проєкт "${project.name}"?`)) {
                    deleteProject(project.id);
                }
            });
            actionsDiv.appendChild(deleteButton);

            li.appendChild(actionsDiv);
            projectList.appendChild(li);
        });
    }

    function populateProjectSelect() {
        const projects = loadProjects();
        [taskProjectSelect, manualTaskProject].forEach(select => {
            select.innerHTML = "";
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "-- Виберіть проєкт --";
            select.appendChild(defaultOption);
            projects.forEach(project => {
                const option = document.createElement("option");
                option.value = project.id;
                option.textContent = project.name;
                select.appendChild(option);
            });
        });
    }

    // ======== Функції для задач ========
    function loadTasks() {
        return currentUser.tasks || [];
    }

    function saveTasks(tasks) {
        currentUser.tasks = tasks;
        updateCurrentUser();
    }

    function saveTask(task) {
        const tasks = loadTasks();
        tasks.push(task);
        saveTasks(tasks);
    }

    function deleteTask(taskId) {
        let tasks = loadTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
    }

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

    function startTask(name, projectId = null) {
        // Генеруємо унікальний id (просто timestamp)
        const id = Date.now();
        activeTaskData = {
            id: id,
            name: name,
            projectId: projectId,
            time: "00:00",
            date: currentDate // Припустимо, що задача створена "сьогодні"
        };

        activeTaskName.textContent = name;
        activeTaskProject.textContent = getProjectNameById(projectId);
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
        updatePieChart();
    }

    // ======== Робота з відображенням таблиці ========
    function createTaskRow(task) {
        const row = document.createElement("tr");

        // Стовпець з назвою
        const nameCell = document.createElement("td");
        nameCell.textContent = task.name;
        row.appendChild(nameCell);

        // Стовпець з проєктом
        const projectCell = document.createElement("td");
        projectCell.textContent = getProjectNameById(task.projectId);
        row.appendChild(projectCell);

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
            startTask(task.name, task.projectId);
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
                updatePieChart();
            }
        });
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        return row;
    }

    function addTaskToTable(task) {
        const row = createTaskRow(task);
        taskTableBody.appendChild(row);
    }

    function renderTasks(tasks) {
        taskTableBody.innerHTML = "";
        tasks.forEach(task => {
            addTaskToTable(task);
        });
    }

    // ======== Обробник Редагування ========
    function editTaskHandler(task, rowElement) {
        const nameCell = rowElement.children[0];
        const projectCell = rowElement.children[1];
        const oldName = task.name;
        const oldProjectId = task.projectId;

        // Створюємо input для назви задачі
        const nameInput = document.createElement("input");
        nameInput.value = oldName;
        nameCell.innerHTML = "";
        nameCell.appendChild(nameInput);

        // Створюємо select для вибору проєкту
        const projectSelect = document.createElement("select");
        const projects = loadProjects();
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Виберіть проєкт --";
        projectSelect.appendChild(defaultOption);
        projects.forEach(project => {
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;
            if (project.id === oldProjectId) {
                option.selected = true;
            }
            projectSelect.appendChild(option);
        });
        projectCell.innerHTML = "";
        projectCell.appendChild(projectSelect);

        // Дії
        const actionCell = rowElement.children[3];
        const oldActionHTML = actionCell.innerHTML;
        actionCell.innerHTML = "";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Зберегти";
        saveButton.addEventListener("click", () => {
            const newName = nameInput.value.trim();
            const newProjectId = projectSelect.value || null;
            if (newName) {
                task.name = newName;
                task.projectId = newProjectId;
                updateTask(task);
                nameCell.textContent = newName;
                projectCell.textContent = getProjectNameById(newProjectId);
                actionCell.innerHTML = oldActionHTML;
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
        const projectId = manualTaskProject.value || null;
        const time = manualTaskTime.value.trim(); // "хв:сек"
        const date = manualTaskDate.value || getTodayDate(); // Якщо не вибрано, то сьогодні
        if (!name) {
            manualTaskError.textContent = "Будь ласка, введіть назву задачі.";
            return;
        }
        if (!time.match(/^\d{1,2}:\d{2}$/)) {
            manualTaskError.textContent = "Час має бути у форматі 'хв:сек', напр. 10:30";
            return;
        }

        // Генеруємо id
        const id = Date.now();
        const newTask = {
            id,
            name,
            projectId,
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
        manualTaskProject.value = "";
        manualTaskTime.value = "";
        manualTaskDate.value = "";
        manualTaskError.textContent = "";
    }

    // ======== Кругова діаграма з Chart.js ========
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
                        label: "Час (сек.)",
                        data: data,
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                            "#E7E9ED",
                            "#76A346",
                            "#A23B4C",
                            "#5A4FCF"
                        ],
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

    // ======== Функції для користувача ========
    function updateCurrentUser() {
        const users = loadUsers();
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) {
            currentUser = updatedUser;
            saveCurrentUser(currentUser);
        }
    }

    function getProjectNameById(projectId) {
        if (!projectId) return "Без проєкту";
        const project = currentUser.projects.find(p => p.id === projectId);
        return project ? project.name : "Не визначено";
    }

    // ======== Обробники подій ========
    showRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
    });

    showLogin.addEventListener("click", (e) => {
        e.preventDefault();
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    // Валідація форми реєстрації
    [registerName, registerEmail, registerPassword].forEach(input => {
        input.addEventListener("input", () => {
            const isValid = registerName.value.trim() !== "" &&
                registerEmail.value.trim() !== "" &&
                registerPassword.value.trim().length >= 3;
            registerButton.disabled = !isValid;
            registerError.textContent = "";
        });
    });

    // Валідація форми авторизації
    [loginEmail, loginPassword].forEach(input => {
        input.addEventListener("input", () => {
            const isValid = loginEmail.value.trim() !== "" &&
                loginPassword.value.trim() !== "";
            loginButton.disabled = !isValid;
            loginError.textContent = "";
        });
    });

    // Валідація форми додавання проєкту
    newProjectName.addEventListener("input", () => {
        addProjectButton.disabled = newProjectName.value.trim() === "";
    });

    // Валідація форми задачі
    [taskNameInput, taskProjectSelect].forEach(input => {
        input.addEventListener("input", () => {
            startTaskButton.disabled = taskNameInput.value.trim() === "";
        });
    });

    // Валідація форми ручного додавання задачі
    [manualTaskName, manualTaskTime].forEach(input => {
        input.addEventListener("input", () => {
            const isValid = manualTaskName.value.trim() !== "" &&
                manualTaskTime.value.trim().match(/^\d{1,2}:\d{2}$/);
            addManualTaskButton.disabled = !isValid;
            manualTaskError.textContent = "";
        });
    });

    // Реєстрація користувача
    registerButton.addEventListener("click", () => {
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value.trim();

        if (findUserByEmail(email)) {
            registerError.textContent = "Користувач з цією поштою вже існує.";
            return;
        }

        registerUser(name, email, password);
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        alert("Реєстрація успішна! Увійдіть у систему.");
    });

    // Авторизація користувача
    loginButton.addEventListener("click", () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        const user = loginUser(email, password);
        if (user) {
            currentUser = user;
            saveCurrentUser(currentUser);
            authSection.classList.add("hidden");
            userSection.classList.remove("hidden");
            currentUserSpan.textContent = `Користувач: ${currentUser.name}`;
            renderProjectList();
            populateProjectSelect();
            historyDatePicker.value = currentDate;
            showTasksForDate(currentDate);
            updatePieChart();
        } else {
            loginError.textContent = "Невірна пошта або пароль.";
        }
    });

    // Вихід з системи
    logoutButton.addEventListener("click", () => {
        logoutCurrentUser();
        currentUser = null;
        userSection.classList.add("hidden");
        authSection.classList.remove("hidden");
        // Скидання стану
        taskTableBody.innerHTML = "";
        if (pieChart) pieChart.destroy();
        activeTask.classList.add("hidden");
        newTaskForm.classList.add("hidden");
        activeTaskData = null;
        timerDisplay.textContent = "00:00";
    });

    // Додавання проєкту
    addProjectButton.addEventListener("click", () => {
        const projectName = newProjectName.value.trim();
        if (projectName !== "") {
            addProject(projectName);
            newProjectName.value = "";
            addProjectButton.disabled = true;
        }
    });

    // Початок нової задачі
    newTaskButton.addEventListener("click", () => {
        newTaskForm.classList.remove("hidden");
    });

    startTaskButton.addEventListener("click", () => {
        const taskName = taskNameInput.value.trim();
        const projectId = taskProjectSelect.value || null;
        if (taskName) {
            taskNameInput.value = "";
            taskProjectSelect.value = "";
            startTaskButton.disabled = true;
            startTask(taskName, projectId);
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
    function initialize() {
        currentUser = getCurrentUser();
        if (currentUser) {
            authSection.classList.add("hidden");
            userSection.classList.remove("hidden");
            currentUserSpan.textContent = `Користувач: ${currentUser.name}`;
            renderProjectList();
            populateProjectSelect();
            historyDatePicker.value = currentDate;
            showTasksForDate(currentDate);
            updatePieChart();
        } else {
            authSection.classList.remove("hidden");
            userSection.classList.add("hidden");
        }
    }

    initialize();
});
