let tasks = [];

// Load tasks from localStorage
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task
function addTask(name, dueDate) {
    const task = {
        id: Date.now(),
        name: name,
        dueDate: dueDate,
        completed: false
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleTaskCompletion(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Filter tasks
function filterTasks(query) {
    return tasks.filter(task => task.name.toLowerCase().includes(query.toLowerCase()));
}

// Render tasks to the table
function renderTasks(filteredTasks = null) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    const tasksToRender = filteredTasks || tasks;

    tasksToRender.forEach(task => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${task.completed ? `<s>${task.name}</s>` : task.name}</td>
            <td>${task.dueDate}</td>
            <td>${task.completed ? 'Completed' : 'Pending'}</td>
            <td>
                <button class="complete" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
            </td>
        `;
        taskList.appendChild(row);
    });
}

// Event listeners
document.getElementById('add-task').addEventListener('click', () => {
    const taskName = document.getElementById('task-name').value.trim();
    const taskDate = document.getElementById('task-date').value;

    if (taskName === '' || taskDate === '') {
        alert('Please enter both task name and due date.');
        return;
    }

    addTask(taskName, taskDate);
    document.getElementById('task-name').value = '';
    document.getElementById('task-date').value = '';
});

document.getElementById('filter').addEventListener('input', (e) => {
    const query = e.target.value;
    const filteredTasks = filterTasks(query);
    renderTasks(filteredTasks);
});

// Initialize the application
loadTasks();
renderTasks();
