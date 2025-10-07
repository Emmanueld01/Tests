// =================================================================
// EMMA TASK - Main Logic (script.js)
// PROFESSIONAL JAVASCRIPT STRUCTURE
// =================================================================

// 1. CONSTANTS AND DOM REFERENCES
// ------------------------------------
const GENERAL_TASKS_KEY = 'emmaTasksGeneral';
const DAILY_TASKS_KEY = 'emmaDailyTasks';

// General To-Do DOM elements
const generalInput = document.getElementById('nuevaTareaGeneral');
const generalAddBtn = document.getElementById('btnAgregarGeneral');
const generalList = document.getElementById('listaTareasGeneral');

// Agenda DOM element
const agendaContainer = document.getElementById('agendaContenedor');

// 🔑 NUEVO: DOM elements for Toggle Functionality
const mainContainer = document.querySelector('.contenedor-principal');
const generalHeader = document.querySelector('.lista-general h2');
const agendaHeader = document.querySelector('.agenda-diaria h2');


// Global state arrays
let generalTasks = [];
let dailyTasks = [];

// Text array for dynamic rendering (English)
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const VALIDATION_MESSAGE = "Please enter a valid task.";


// 2. PERSISTENCE FUNCTIONS (localStorage)
// -------------------------------------------

/**
 * Saves the current state of a task array to localStorage.
 * @param {string} key - The localStorage key.
 * @param {Array<Object>} tasksArray - The array of tasks to save.
 */
function saveTasks(key, tasksArray) {
    localStorage.setItem(key, JSON.stringify(tasksArray));
}

/**
 * Loads tasks from localStorage based on the key.
 * @param {string} key - The localStorage key.
 * @returns {Array<Object>} The loaded tasks or an empty array.
 */
function loadTasks(key) {
    const savedTasks = localStorage.getItem(key);
    return savedTasks ? JSON.parse(savedTasks) : [];
}


// 3. CORE DOM MANIPULATION & LOGIC
// -----------------------------------------------

/**
 * Generates a unique ID for a date (YYYY-MM-DD format).
 * @param {Date} date - The date object.
 * @returns {string} The formatted date ID.
 */
function generateDateId(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Creates and returns an <li> element for a task.
 * @param {Object} task - The task object {id, text, completed, [date]}.
 * @param {boolean} isDaily - True if it's a daily task, false otherwise.
 * @returns {HTMLLIElement} The ready-to-insert <li> element.
 */
function createLiElement(task, isDaily) {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    
    // Apply 'completed' class if necessary
    if (task.completed) {
        li.classList.add('completed');
    }
    
    li.innerHTML = `${task.text}`; 

    // Delete Icon
    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fas', 'fa-trash-alt', 'delete-task');
    li.appendChild(deleteIcon);
    
    // Event Handlers (Click/Toggle & Delete)
    deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation(); 
        isDaily ? deleteDailyTask(task.id) : deleteGeneralTask(task.id);
    });

    li.addEventListener('click', () => {
        isDaily ? toggleDailyTask(task.id) : toggleGeneralTask(task.id);
    });
    
    return li;
}


// 4. GENERAL TO-DO LIST LOGIC
// ----------------------------

/**
 * Renders the general tasks from the 'generalTasks' array to the DOM.
 */
function renderGeneralTasks() {
    generalList.innerHTML = '';
    generalTasks.forEach(task => {
        const liElement = createLiElement(task, false); // Not a daily task
        generalList.appendChild(liElement);
    });
}

/**
 * Adds a new task to the general list.
 */
function addGeneralTask() {
    const text = generalInput.value.trim();
    if (text === "") {
        alert(VALIDATION_MESSAGE);
        return;
    }

    const newId = Date.now().toString(); 
    const newTask = {
        id: newId,
        text: text,
        completed: false
    };
    
    generalTasks.push(newTask);
    saveTasks(GENERAL_TASKS_KEY, generalTasks);
    renderGeneralTasks(); 

    generalInput.value = '';
}

/**
 * Toggles the 'completed' status of a general task.
 * @param {string} id - The unique ID of the task.
 */
function toggleGeneralTask(id) {
    const taskIndex = generalTasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        generalTasks[taskIndex].completed = !generalTasks[taskIndex].completed;
        saveTasks(GENERAL_TASKS_KEY, generalTasks);
        renderGeneralTasks();
    }
}

/**
 * Deletes a general task from the array and re-renders.
 * @param {string} id - The unique ID of the task.
 */
function deleteGeneralTask(id) {
    generalTasks = generalTasks.filter(t => t.id !== id);
    saveTasks(GENERAL_TASKS_KEY, generalTasks);
    renderGeneralTasks();
}


// 5. DAILY SCHEDULE LOGIC
// -------------------------

/**
 * Renders the full 7-day structure and injects daily tasks.
 */
function renderWeeklySchedule() {
    agendaContainer.innerHTML = '';
    
    const today = new Date();
    
    // Loop to display the next 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = WEEK_DAYS[date.getDay()];
        const dateId = generateDateId(date);
        const isToday = i === 0;

        // Create Day Container
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('dia');
        if (isToday) {
            dayDiv.classList.add('today'); 
        }
        dayDiv.setAttribute('data-date', dateId);
        
        // Inject HTML structure for the day
        dayDiv.innerHTML = `
            <h3>${dayName} <span class="date">(${date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })})</span></h3>
            <div class="input-grupo-dia">
                <input type="text" id="input-${dateId}" placeholder="Task for ${dayName}...">
                <button class="btn-add-day" data-date-id="${dateId}"><i class="fas fa-paper-plane"></i></button>
            </div>
            <ul class="lista-tareas-dia" id="list-${dateId}">
                </ul>
        `;
        
        agendaContainer.appendChild(dayDiv);
    }
    
    // After rendering the structure, load tasks and assign handlers
    loadAndRenderDailyTasks();
    assignDailyHandlers();
}

/**
 * Assigns event listeners to the daily schedule inputs and buttons.
 */
function assignDailyHandlers() {
    document.querySelectorAll('.btn-add-day').forEach(button => {
        button.addEventListener('click', () => {
            const dateId = button.getAttribute('data-date-id');
            addDailyTask(dateId);
        });
    });
    
    document.querySelectorAll('.input-grupo-dia input[type="text"]').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Find the corresponding button's data-date-id
                const dateId = input.parentElement.querySelector('.btn-add-day').getAttribute('data-date-id');
                addDailyTask(dateId);
            }
        });
    });
}

/**
 * Adds a task to the schedule for a specific day.
 * @param {string} dateId - The date ID ('YYYY-MM-DD').
 */
function addDailyTask(dateId) {
    const input = document.getElementById(`input-${dateId}`);
    const text = input.value.trim();
    if (text === "") return;
    
    const newTask = {
        id: Date.now().toString(),
        text: text,
        date: dateId, // Specific date linkage
        completed: false
    };
    
    dailyTasks.push(newTask);
    saveTasks(DAILY_TASKS_KEY, dailyTasks);
    
    renderDailyTasksByDate(dateId);
    
    input.value = '';
}

/**
 * Renders tasks for a specific date on the schedule.
 * @param {string} dateId - The date ID ('YYYY-MM-DD').
 */
function renderDailyTasksByDate(dateId) {
    const listUL = document.getElementById(`list-${dateId}`);
    if (!listUL) return;
    
    listUL.innerHTML = '';
    
    const tasksForDay = dailyTasks.filter(t => t.date === dateId);
    
    tasksForDay.forEach(task => {
        const liElement = createLiElement(task, true); // It is a daily task
        listUL.appendChild(liElement);
    });
}

/**
 * Iterates over the rendered days and loads their respective tasks.
 */
function loadAndRenderDailyTasks() {
    document.querySelectorAll('.dia').forEach(dayDiv => {
        const dateId = dayDiv.getAttribute('data-date');
        renderDailyTasksByDate(dateId);
    });
}

/**
 * Toggles the 'completed' status of a daily task.
 * @param {string} id - The unique ID of the daily task.
 */
function toggleDailyTask(id) {
    const taskIndex = dailyTasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        const task = dailyTasks[taskIndex];
        task.completed = !task.completed;
        saveTasks(DAILY_TASKS_KEY, dailyTasks);
        renderDailyTasksByDate(task.date); // Only re-render the affected day
    }
}

/**
 * Deletes a daily task from the array and re-renders the specific day.
 * @param {string} id - The unique ID of the daily task.
 */
function deleteDailyTask(id) {
    const taskToDelete = dailyTasks.find(t => t.id === id);
    if (!taskToDelete) return;
    
    dailyTasks = dailyTasks.filter(t => t.id !== id);
    saveTasks(DAILY_TASKS_KEY, dailyTasks);
    renderDailyTasksByDate(taskToDelete.date);
}

// 6. UI TOGGLE LOGIC (Logic for smooth, direct focus switching)
// -----------------------------------------------------------

/**
 * Ensures the layout is forced into one of three clean states: Agenda Focused,
 * General List Focused, or Default.
 * @param {string} clickedSection - 'general' or 'agenda'.
 */
function handleLayoutToggle(clickedSection) {
    const isAgendaFocused = mainContainer.classList.contains('agenda-focused');
    const isListFocused = mainContainer.classList.contains('list-focused');
    
    // Función de ayuda para limpiar ambos estados de foco (la clave de la solución)
    const clearFocusClasses = () => {
        mainContainer.classList.remove('agenda-focused');
        mainContainer.classList.remove('list-focused');
    };

    if (clickedSection === 'agenda') {
        if (isAgendaFocused) {
            // Caso 1: Ya en foco -> Limpiar foco para volver al estado normal.
            clearFocusClasses();
        } else {
            // Caso 2: Poner foco en Agenda. Limpiamos todo y añadimos SOLO esta clase.
            clearFocusClasses();
            mainContainer.classList.add('agenda-focused');
        }
    } else if (clickedSection === 'general') {
        if (isListFocused) {
            // Caso 3: Ya en foco -> Limpiar foco para volver al estado normal.
            clearFocusClasses();
        } else {
            // Caso 4: Poner foco en General. Limpiamos todo y añadimos SOLO esta clase.
            clearFocusClasses();
            mainContainer.classList.add('list-focused');
        }
    }
}

// 7. APPLICATION INITIALIZATION
// -------------------------------

/**
 * Main function to run when the script loads.
 * Handles data loading and event setup.
 */
function initializeApp() {
    // 1. General Tasks (To-Do)
    generalTasks = loadTasks(GENERAL_TASKS_KEY);
    renderGeneralTasks();
    
    // Event listeners for General To-Do
    generalAddBtn.addEventListener('click', addGeneralTask);
    generalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addGeneralTask();
        }
    });

    // 2. Daily Schedule
    dailyTasks = loadTasks(DAILY_TASKS_KEY);
    renderWeeklySchedule(); // Renders structure, loads tasks, and assigns handlers

    // 🔑 NUEVO: UI Toggle Setup (Makes the headers clickable)
    generalHeader.addEventListener('click', () => {
        handleLayoutToggle('general');
    });

    agendaHeader.addEventListener('click', () => {
        handleLayoutToggle('agenda');
    });
}

// Start the application
initializeApp();