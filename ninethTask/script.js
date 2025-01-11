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

    let timerInterval;
    let startTime;
    let activeTaskData = null;

    // Load tasks from local storage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach((task) => addTaskToTable(task));
    };

    // Save task to local storage
    const saveTask = (task) => {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    // Update timer display
    const updateTimer = () => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
        const seconds = String(elapsedTime % 60).padStart(2, "0");
        timerDisplay.textContent = `${minutes}:${seconds}`;
    };

    // Add task to table
    const addTaskToTable = (task) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = task.name;
        row.appendChild(nameCell);

        const timeCell = document.createElement("td");
        timeCell.textContent = task.time;
        row.appendChild(timeCell);

        const actionCell = document.createElement("td");
        const continueButton = document.createElement("button");
        continueButton.textContent = "Продовжити";
        continueButton.addEventListener("click", () => {
            startTask(task.name);
        });
        actionCell.appendChild(continueButton);
        row.appendChild(actionCell);

        taskTableBody.appendChild(row);
    };

    // Start a new task
    const startTask = (name) => {
        activeTaskData = { name, time: "00:00" };
        activeTaskName.textContent = name;
        newTaskForm.classList.add("hidden");
        activeTask.classList.remove("hidden");
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    };

    // Finish the active task
    const finishTask = () => {
        clearInterval(timerInterval);
        const elapsedTime = timerDisplay.textContent;
        activeTaskData.time = elapsedTime;
        saveTask(activeTaskData);
        addTaskToTable(activeTaskData);
        activeTask.classList.add("hidden");
        activeTaskData = null;
    };

    // Event listeners
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

    // Initialize
    loadTasks();
});
