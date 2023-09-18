const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText !== '') {
    const task = {
      text: taskText,
      id: Date.now(),
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
  }
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="arrows">
        <button class="up-arrow" onclick="moveTask(${index}, 'up')">▲</button>
        <button class="down-arrow" onclick="moveTask(${index}, 'down')">▼</button>
      </div>
      <span>${index + 1}. ${task.text}</span>
      <button class="delete-button" onclick="deleteTask(${task.id})">Delete</button>
    `;
    li.setAttribute('draggable', true);
    li.setAttribute('id', task.id);
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    taskList.appendChild(li);
  });
}

function moveTask(index, direction) {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex >= 0 && targetIndex < tasks.length) {
    const temp = tasks[index];
    tasks[index] = tasks[targetIndex];
    tasks[targetIndex] = temp;
    saveTasks();
    renderTasks();
  }
}

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  const sourceId = e.dataTransfer.getData('text/plain');
  const sourceElement = document.getElementById(sourceId);
  const targetElement = e.target.closest('li');
  const sourceIndex = Array.from(targetElement.parentNode.children).indexOf(sourceElement);
  const targetIndex = Array.from(targetElement.parentNode.children).indexOf(targetElement);

  if (sourceIndex < targetIndex) {
    targetElement.parentNode.insertBefore(sourceElement, targetElement.nextSibling);
  } else {
    targetElement.parentNode.insertBefore(sourceElement, targetElement);
  }

  tasks.splice(targetIndex, 0, tasks.splice(sourceIndex, 1)[0]);
  updateTaskNumbers(); // Update task numbers instantly
  saveTasks();
}

function updateTaskNumbers() {
  const taskElements = taskList.querySelectorAll('li');
  taskElements.forEach((taskElement, index) => {
    const taskTextElement = taskElement.querySelector('span');
    taskTextElement.textContent = `${index + 1}. ${taskTextElement.textContent.slice(3)}`;
  });
}

addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

renderTasks();
