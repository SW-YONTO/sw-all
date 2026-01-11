/**
 * Green Home - Notion Clone with Themes + Calendar
 * Features: Theme-specific images, calendar, draggable blocks, todos
 */

const STORAGE_KEY = 'greenHomeBlocks';
let state = { 
    todos: {}, 
    theme: 'green', 
    pageTitle: '🌿 Green Home', 
    customTitle: false,
    blockTitles: {},  // Stores block title text by day/block id
    courses: [],      // Stores course list items
    customContent: {} // Stores any other editable content by element id
};

const DEFAULT_TODOS = {
    monday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    tuesday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    wednesday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    thursday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    friday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    saturday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    sunday: [{ time: '09:00', text: 'Test Phy', done: false }, { time: '11:00', text: 'Test Chem', done: false }, { time: '13:00', text: 'Test Maths', done: false }]
};

const DEFAULT_COURSES = [
    { emoji: '🌱', text: 'Course 1' },
    { emoji: '🌿', text: 'Course 2' },
    { emoji: '🍀', text: 'Course 3' },
    { emoji: '🌲', text: 'Course 4' },
    { emoji: '🎋', text: 'Course 5' },
    { emoji: '🎍', text: 'Course 6' }
];

const THEME_TITLES = {
    green: '🌿 Green Home',
    wegabong: '🍌 Wegabong',
    ocean: '🌊 Ocean Dreams',
    sunset: '🌅 Sunset Vibes',
    dark: '🌑 Dark Mode',
    purple: '💜 Purple Vibes'
};

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderTodos();
    initTheme();
    initBlockControls();
    initBlockMenu();
    loadSavedBlocks();        // NEW: Load dynamically added blocks
    initContentPersistence();
    loadSavedContent();
    console.log('🌿 Green Home loaded!');
});

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        state = {
            todos: parsed.todos || JSON.parse(JSON.stringify(DEFAULT_TODOS)),
            theme: parsed.theme || 'green',
            pageTitle: parsed.pageTitle || '🌿 Green Home',
            customTitle: parsed.customTitle || false,
            blockTitles: parsed.blockTitles || {},
            courses: parsed.courses || JSON.parse(JSON.stringify(DEFAULT_COURSES)),
            customContent: parsed.customContent || {},
            dynamicBlocks: parsed.dynamicBlocks || []  // NEW: Store added blocks
        };
    } else {
        state = { 
            todos: JSON.parse(JSON.stringify(DEFAULT_TODOS)), 
            theme: 'green', 
            pageTitle: '🌿 Green Home', 
            customTitle: false,
            blockTitles: {},
            courses: JSON.parse(JSON.stringify(DEFAULT_COURSES)),
            customContent: {},
            dynamicBlocks: []  // NEW
        };
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Save a newly created block
function saveBlock(type, blockData = {}) {
    const blockInfo = {
        id: 'block_' + Date.now(),
        type: type,
        data: blockData,
        createdAt: Date.now()
    };
    if (!state.dynamicBlocks) state.dynamicBlocks = [];
    state.dynamicBlocks.push(blockInfo);
    saveState();
    return blockInfo.id;
}

// Load saved blocks on page load
function loadSavedBlocks() {
    if (!state.dynamicBlocks || state.dynamicBlocks.length === 0) return;
    
    const todoGrid = document.querySelector('.todo-grid');
    if (!todoGrid) return;
    
    state.dynamicBlocks.forEach(blockInfo => {
        // Recreate the block
        createNewBlock(blockInfo.type, blockInfo.id, blockInfo.data);
    });
}

// ===== Theme =====
function initTheme() {
    const select = document.getElementById('themeSelect');
    
    // Dynamically populate theme dropdown from THEME_TITLES
    select.innerHTML = '';
    Object.keys(THEME_TITLES).forEach(themeKey => {
        const option = document.createElement('option');
        option.value = themeKey;
        option.textContent = THEME_TITLES[themeKey];
        select.appendChild(option);
    });
    
    applyTheme(state.theme);
    select.value = state.theme;
    select.addEventListener('change', (e) => {
        state.theme = e.target.value;
        applyTheme(state.theme);
        saveState();
    });
    
    // Page title - editable and saves custom name
    const titleEl = document.getElementById('pageTitle');
    if (state.pageTitle) titleEl.textContent = state.pageTitle;
    titleEl.addEventListener('blur', () => {
        const newTitle = titleEl.textContent.trim();
        // Check if user changed from default theme title
        if (newTitle !== THEME_TITLES[state.theme]) {
            state.customTitle = true;
        }
        state.pageTitle = newTitle;
        saveState();
    });
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    
    // Update images
    const bannerImg = document.getElementById('bannerImg');
    const sidebarImg = document.getElementById('sidebarImg');
    
    if (bannerImg) bannerImg.src = `themes/${theme}/banner.png`;
    if (sidebarImg) sidebarImg.src = `themes/${theme}/sidebar.png`;
    
    // Only update page title if user hasn't customized it
    if (!state.customTitle && THEME_TITLES[theme]) {
        const titleEl = document.getElementById('pageTitle');
        titleEl.textContent = THEME_TITLES[theme];
        state.pageTitle = THEME_TITLES[theme];
    }
}

// ===== Render Todos =====
function renderTodos() {
    document.querySelectorAll('.todo-block').forEach(block => {
        const day = block.dataset.day;
        const list = block.querySelector('.todo-list');
        if (!list) return;
        list.innerHTML = '';
        if (!state.todos[day]) state.todos[day] = [];
        state.todos[day].forEach((todo, idx) => {
            list.appendChild(createTodoItem(day, idx, todo));
        });
    });
}

function createTodoItem(day, idx, todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' completed' : '');
    li.draggable = true;
    li.dataset.idx = idx;
    li.innerHTML = `
        <div class="todo-controls">
            <button class="ctrl-btn todo-add-btn">+</button>
            <button class="ctrl-btn todo-drag-btn">⁝⁝</button>
        </div>
        <input type="checkbox" class="todo-checkbox" ${todo.done ? 'checked' : ''}>
        <span class="todo-time" contenteditable="true">${todo.time}</span>
        <span class="todo-text" contenteditable="true">${todo.text}</span>
        <button class="todo-delete">×</button>
    `;
    
    li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
        state.todos[day][idx].done = e.target.checked;
        li.classList.toggle('completed', e.target.checked);
        saveState();
    });
    li.querySelector('.todo-time').addEventListener('blur', (e) => {
        state.todos[day][idx].time = e.target.textContent.trim();
        saveState();
    });
    li.querySelector('.todo-text').addEventListener('blur', (e) => {
        state.todos[day][idx].text = e.target.textContent.trim();
        saveState();
    });
    li.querySelector('.todo-add-btn').addEventListener('click', () => {
        state.todos[day].splice(idx + 1, 0, { time: '00:00', text: 'New task', done: false });
        saveState();
        renderTodos();
    });
    li.querySelector('.todo-delete').addEventListener('click', () => {
        state.todos[day].splice(idx, 1);
        saveState();
        renderTodos();
    });
    
    // Drag for reordering
    li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ day, idx }));
        li.classList.add('dragging');
    });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
    li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('drag-over'); });
    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
    li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.day === day) {
            const [moved] = state.todos[day].splice(data.idx, 1);
            state.todos[day].splice(idx, 0, moved);
            saveState();
            renderTodos();
        }
    });
    return li;
}

// ===== Block Controls =====
function initBlockControls() {
    document.querySelectorAll('.delete-block-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this block?')) {
                const block = btn.closest('.block');
                const day = block.dataset.day;
                if (day && state.todos[day]) delete state.todos[day];
                block.remove();
                saveState();
            }
        });
    });
    
    document.querySelectorAll('.add-block-btn').forEach(btn => {
        btn.addEventListener('click', (e) => showBlockMenu(e, btn.closest('.block')));
    });
    
    // Block dragging - use window.draggedBlock for shared state with dynamic blocks
    window.draggedBlock = null;
    document.querySelectorAll('.block').forEach(block => {
        const dragBtn = block.querySelector('.drag-block-btn');
        if (dragBtn) {
            dragBtn.addEventListener('mousedown', () => block.setAttribute('draggable', true));
            dragBtn.addEventListener('mouseup', () => block.setAttribute('draggable', false));
        }
        block.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('todo-item')) return;
            window.draggedBlock = block;
            block.classList.add('dragging');
        });
        block.addEventListener('dragend', () => {
            block.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            window.draggedBlock = null;
        });
        block.addEventListener('dragover', (e) => {
            if (!window.draggedBlock || window.draggedBlock === block) return;
            e.preventDefault();
            block.classList.add('drag-over');
        });
        block.addEventListener('dragleave', () => block.classList.remove('drag-over'));
        block.addEventListener('drop', (e) => {
            if (!window.draggedBlock || window.draggedBlock === block) return;
            e.preventDefault();
            block.classList.remove('drag-over');
            block.parentElement.insertBefore(window.draggedBlock, block);
        });
    });
}

// ===== Block Menu =====
let currentInsertAfter = null;

function initBlockMenu() {
    const menu = document.getElementById('blockMenu');
    const addBtn = document.getElementById('addNewBlockBtn');
    const searchInput = document.getElementById('blockSearchInput');
    
    addBtn.addEventListener('click', () => {
        currentInsertAfter = null;
        menu.classList.add('active');
        searchInput.focus();
    });
    
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !e.target.closest('.add-block-btn') && !e.target.closest('.add-new-block-btn')) {
            menu.classList.remove('active');
        }
    });
    
    searchInput.addEventListener('input', (e) => {
        const filter = e.target.value.toLowerCase();
        document.querySelectorAll('.block-option').forEach(opt => {
            opt.style.display = opt.textContent.toLowerCase().includes(filter) ? '' : 'none';
        });
    });
    
    document.querySelectorAll('.block-option').forEach(opt => {
        opt.addEventListener('click', () => {
            createNewBlock(opt.dataset.type, null, null, true); // true = save to state
            menu.classList.remove('active');
            searchInput.value = '';
        });
    });
}

function showBlockMenu(e, insertAfterBlock) {
    currentInsertAfter = insertAfterBlock;
    document.getElementById('blockMenu').classList.add('active');
    document.getElementById('blockSearchInput').focus();
}

// isNew = true means save to state, false means restoring from saved data
function createNewBlock(type, savedId = null, savedData = null, isNew = false) {
    const block = document.createElement('div');
    block.className = 'block';
    block.draggable = true;
    block.dataset.blockType = type;
    
    // Save new blocks to state
    if (isNew) {
        const blockId = saveBlock(type, {});
        block.dataset.blockId = blockId;
    } else if (savedId) {
        block.dataset.blockId = savedId;
    }
    
    let content = '';
    switch(type) {
        case 'text':
            content = `<p contenteditable="true" style="font-size:14px;outline:none;">Click to edit text...</p>`;
            break;
        case 'heading':
            content = `<h2 contenteditable="true" style="font-size:20px;font-weight:600;outline:none;">New Heading</h2>`;
            break;
        case 'todo':
            const newDay = 'custom_' + Date.now();
            state.todos[newDay] = [{ time: '09:00', text: 'New task', done: false }];
            saveState();
            block.dataset.day = newDay;
            block.classList.add('todo-block');
            content = `<h3 class="block-title" contenteditable="true">📝 New Todo</h3><ul class="todo-list"></ul>`;
            break;
        case 'list':
            content = `<h3 class="block-title" contenteditable="true">📋 New List</h3>
                <ul class="simple-list">
                    <li><span class="emoji">•</span> <span contenteditable="true">Item 1</span></li>
                    <li><span class="emoji">•</span> <span contenteditable="true">Item 2</span></li>
                </ul>`;
            break;
        case 'calendar':
            block.classList.add('calendar-block');
            content = createCalendarContent();
            break;
        case 'clock':
            block.classList.add('clock-block');
            const clockId = 'clock_' + Date.now();
            block.dataset.clockId = clockId;
            content = `<h3 class="block-title" contenteditable="true">🕐 Clock</h3>
                <div class="clock-display" id="${clockId}" data-mode="digital">
                    <div class="clock-digital">
                        <div class="clock-time">00:00:00</div>
                        <div class="clock-date">Loading...</div>
                    </div>
                    <div class="clock-analog" style="display:none;">
                        <svg viewBox="0 0 100 100" class="analog-face">
                            <circle cx="50" cy="50" r="48" fill="var(--bg-block)" stroke="var(--accent-light)" stroke-width="2"/>
                            <!-- Hour markers -->
                            <line x1="50" y1="5" x2="50" y2="10" stroke="var(--text-secondary)" stroke-width="2"/>
                            <line x1="50" y1="90" x2="50" y2="95" stroke="var(--text-secondary)" stroke-width="2"/>
                            <line x1="5" y1="50" x2="10" y2="50" stroke="var(--text-secondary)" stroke-width="2"/>
                            <line x1="90" y1="50" x2="95" y2="50" stroke="var(--text-secondary)" stroke-width="2"/>
                            <line x1="25" y1="7" x2="27" y2="11" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="7" y1="25" x2="11" y2="27" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="75" y1="7" x2="73" y2="11" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="89" y1="25" x2="93" y2="27" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="25" y1="93" x2="27" y2="89" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="7" y1="75" x2="11" y2="73" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="75" y1="93" x2="73" y2="89" stroke="var(--text-muted)" stroke-width="1"/>
                            <line x1="89" y1="75" x2="93" y2="73" stroke="var(--text-muted)" stroke-width="1"/>
                            <!-- Hands -->
                            <line class="hour-hand" x1="50" y1="50" x2="50" y2="30" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round"/>
                            <line class="minute-hand" x1="50" y1="50" x2="50" y2="20" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round"/>
                            <line class="second-hand" x1="50" y1="50" x2="50" y2="15" stroke="var(--accent-light)" stroke-width="1" stroke-linecap="round"/>
                            <circle cx="50" cy="50" r="3" fill="var(--accent-light)"/>
                        </svg>
                    </div>
                    <div class="clock-buttons">
                        <button class="clock-toggle-btn">Switch Mode</button>
                    </div>
                </div>`;
            break;
        case 'image':
            block.classList.add('image-block');
            const imgId = 'img_' + Date.now();
            block.dataset.imgId = imgId;
            content = `<div class="image-upload-zone" id="${imgId}">
                <div class="upload-placeholder">
                    <span class="upload-icon">🖼️</span>
                    <p>Drag image here or</p>
                    <input type="text" class="image-url-input" placeholder="Paste image URL...">
                    <button class="load-image-btn">Load Image</button>
                </div>
                <img src="" class="block-image" alt="Image" style="display:none;">
            </div>`;
            break;
        case 'pomodoro':
            block.classList.add('pomodoro-block');
            const pomId = 'pom_' + Date.now();
            block.dataset.pomId = pomId;
            content = `<h3 class="block-title" contenteditable="true">🍅 Pomodoro Timer</h3>
                <div class="pomodoro-display" id="${pomId}">
                    <div class="pom-time">25:00</div>
                    <div class="pom-status">Ready to focus</div>
                    <div class="pom-controls">
                        <button class="pom-btn pom-start">▶ Start</button>
                        <button class="pom-btn pom-pause" style="display:none;">⏸ Pause</button>
                        <button class="pom-btn pom-reset">↻ Reset</button>
                    </div>
                    <div class="pom-modes">
                        <button class="pom-mode active" data-minutes="25">Work</button>
                        <button class="pom-mode" data-minutes="5">Short Break</button>
                        <button class="pom-mode" data-minutes="15">Long Break</button>
                    </div>
                </div>`;
            break;
        case 'alarm':
            block.classList.add('alarm-block');
            const alarmBlockId = 'alarms_' + Date.now();
            block.dataset.alarmBlockId = alarmBlockId;
            content = `<h3 class="block-title" contenteditable="true">⏰ Alarms</h3>
                <div class="alarms-container" id="${alarmBlockId}">
                    <div class="alarm-list"></div>
                    <div class="add-alarm-form">
                        <input type="text" class="alarm-label-input" placeholder="Alarm label...">
                        <input type="time" class="new-alarm-time">
                        <button class="add-alarm-btn">+ Add Alarm</button>
                    </div>
                </div>`;
            break;
        case 'quote':
            content = `<blockquote style="border-left:3px solid var(--accent);padding-left:15px;font-style:italic;color:var(--text-secondary);" contenteditable="true">"Click to edit quote..."</blockquote>`;
            break;
    }
    
    block.innerHTML = `
        <div class="block-controls"><button class="ctrl-btn add-block-btn">+</button><button class="ctrl-btn drag-block-btn">⁝⁝</button></div>
        <div class="block-content">${content}</div>
        <button class="delete-block-btn">×</button>
    `;
    
    // Insert block in the same column as the clicked block, or in the left column for new blocks
    if (currentInsertAfter) {
        currentInsertAfter.after(block);
    } else {
        // Default to left sidebar column for better visibility, fallback to todo-grid
        const leftColumn = document.querySelector('.block-column[data-col-id="col-left"]');
        const todoGrid = document.querySelector('.todo-grid');
        if (leftColumn) {
            leftColumn.appendChild(block);
        } else if (todoGrid) {
            todoGrid.appendChild(block);
        }
    }
    
    block.querySelector('.delete-block-btn').addEventListener('click', () => {
        if (confirm('Delete this block?')) {
            const day = block.dataset.day;
            const blockId = block.dataset.blockId;
            
            if (day) delete state.todos[day];
            
            // Remove from dynamicBlocks array
            if (blockId && state.dynamicBlocks) {
                state.dynamicBlocks = state.dynamicBlocks.filter(b => b.id !== blockId);
            }
            
            block.remove();
            saveState();
        }
    });
    
    block.querySelector('.add-block-btn').addEventListener('click', (e) => showBlockMenu(e, block));
    
    // Enable dragging for new blocks
    const dragBtn = block.querySelector('.drag-block-btn');
    if (dragBtn) {
        dragBtn.addEventListener('mousedown', () => block.setAttribute('draggable', true));
        dragBtn.addEventListener('mouseup', () => block.setAttribute('draggable', false));
    }
    block.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('todo-item')) return;
        window.draggedBlock = block;
        block.classList.add('dragging');
    });
    block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        window.draggedBlock = null;
    });
    block.addEventListener('dragover', (e) => {
        if (!window.draggedBlock || window.draggedBlock === block) return;
        e.preventDefault();
        block.classList.add('drag-over');
    });
    block.addEventListener('dragleave', () => block.classList.remove('drag-over'));
    block.addEventListener('drop', (e) => {
        if (!window.draggedBlock || window.draggedBlock === block) return;
        e.preventDefault();
        block.classList.remove('drag-over');
        block.parentElement.insertBefore(window.draggedBlock, block);
    });
    
    if (type === 'todo') renderTodosForBlock(block);
    if (type === 'calendar') initCalendarNav(block);
    if (type === 'clock') initClock(block);
    if (type === 'image') initImageUpload(block);
    if (type === 'pomodoro') initPomodoro(block);
    if (type === 'alarm') initAlarmBlock(block);
}

function renderTodosForBlock(block) {
    const day = block.dataset.day;
    const list = block.querySelector('.todo-list');
    if (!list || !day) return;
    list.innerHTML = '';
    if (!state.todos[day]) state.todos[day] = [];
    state.todos[day].forEach((todo, idx) => {
        list.appendChild(createTodoItem(day, idx, todo));
    });
}

// ===== Calendar =====
function createCalendarContent() {
    const now = new Date();
    return `
        <h3 class="block-title" contenteditable="true">📅 Assignments & Exams</h3>
        <div class="calendar-header">
            <button class="cal-nav cal-prev">‹</button>
            <span class="cal-month">${now.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button class="cal-nav cal-next">›</button>
        </div>
        <div class="calendar-grid">
            ${generateCalendarGrid(now.getFullYear(), now.getMonth())}
        </div>
    `;
}

function generateCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '<div class="cal-days">' + days.map(d => `<span>${d}</span>`).join('') + '</div><div class="cal-dates">';
    
    for (let i = 0; i < firstDay; i++) html += '<span class="cal-empty"></span>';
    
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
        html += `<span class="cal-date${isToday ? ' today' : ''}">${d}</span>`;
    }
    
    html += '</div>';
    return html;
}

function initCalendarNav(block) {
    let currentDate = new Date();
    const monthEl = block.querySelector('.cal-month');
    const gridEl = block.querySelector('.calendar-grid');
    const blockId = block.dataset.blockId;
    
    // Initialize calendar events in state
    if (!state.calendarEvents) state.calendarEvents = {};
    
    function getDateKey(year, month, day) {
        return `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    }
    
    function updateCalendarView() {
        monthEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        gridEl.innerHTML = generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth());
        attachDateListeners();
        markEventsOnCalendar();
    }
    
    function markEventsOnCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        gridEl.querySelectorAll('.cal-date').forEach(dateEl => {
            const day = parseInt(dateEl.textContent);
            const dateKey = getDateKey(year, month, day);
            if (state.calendarEvents[dateKey] && state.calendarEvents[dateKey].length > 0) {
                dateEl.classList.add('has-event');
                const event = state.calendarEvents[dateKey][0];
                dateEl.title = state.calendarEvents[dateKey].map(e => e.title).join(', ');
                if (event.color) dateEl.dataset.eventColor = event.color;
            }
        });
    }
    
    function showEventModal(day, dateKey, existingEvent = null) {
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const isEdit = !!existingEvent;
        
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        modal.innerHTML = `
            <div class="event-modal-content">
                <div class="event-modal-title">${isEdit ? '✏️ Edit Event' : '📅 Add Event'}</div>
                <div class="event-modal-date">${day} ${monthName} ${currentDate.getFullYear()}</div>
                <input type="text" class="event-input" placeholder="Event title..." value="${existingEvent?.title || ''}">
                <div class="event-colors">
                    <div class="event-color ${!existingEvent?.color ? 'selected' : ''}" data-color="" style="background: var(--accent-light)"></div>
                    <div class="event-color ${existingEvent?.color === 'red' ? 'selected' : ''}" data-color="red" style="background: #ef4444"></div>
                    <div class="event-color ${existingEvent?.color === 'orange' ? 'selected' : ''}" data-color="orange" style="background: #f97316"></div>
                    <div class="event-color ${existingEvent?.color === 'yellow' ? 'selected' : ''}" data-color="yellow" style="background: #eab308"></div>
                    <div class="event-color ${existingEvent?.color === 'green' ? 'selected' : ''}" data-color="green" style="background: #22c55e"></div>
                    <div class="event-color ${existingEvent?.color === 'blue' ? 'selected' : ''}" data-color="blue" style="background: #3b82f6"></div>
                    <div class="event-color ${existingEvent?.color === 'purple' ? 'selected' : ''}" data-color="purple" style="background: #a855f7"></div>
                </div>
                <div class="event-modal-btns">
                    ${isEdit ? '<button class="event-modal-btn delete" style="background:#dc3545;color:white;margin-right:auto;">Delete</button>' : ''}
                    <button class="event-modal-btn cancel">Cancel</button>
                    <button class="event-modal-btn save">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const input = modal.querySelector('.event-input');
        input.focus();
        
        let selectedColor = existingEvent?.color || '';
        
        modal.querySelectorAll('.event-color').forEach(colorEl => {
            colorEl.addEventListener('click', () => {
                modal.querySelectorAll('.event-color').forEach(c => c.classList.remove('selected'));
                colorEl.classList.add('selected');
                selectedColor = colorEl.dataset.color;
            });
        });
        
        modal.querySelector('.cancel').addEventListener('click', () => modal.remove());
        
        modal.querySelector('.save').addEventListener('click', () => {
            const title = input.value.trim();
            if (title) {
                if (!state.calendarEvents[dateKey]) state.calendarEvents[dateKey] = [];
                if (isEdit) {
                    existingEvent.title = title;
                    existingEvent.color = selectedColor;
                } else {
                    state.calendarEvents[dateKey].push({ title, color: selectedColor });
                }
                saveState();
                markEventsOnCalendar();
            }
            modal.remove();
        });
        
        if (isEdit) {
            modal.querySelector('.delete').addEventListener('click', () => {
                state.calendarEvents[dateKey] = state.calendarEvents[dateKey].filter(e => e !== existingEvent);
                if (state.calendarEvents[dateKey].length === 0) delete state.calendarEvents[dateKey];
                saveState();
                markEventsOnCalendar();
                modal.remove();
            });
        }
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') modal.querySelector('.save').click();
        });
    }
    
    function attachDateListeners() {
        gridEl.querySelectorAll('.cal-date').forEach(dateEl => {
            dateEl.addEventListener('click', () => {
                const day = parseInt(dateEl.textContent);
                const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
                const existingEvents = state.calendarEvents[dateKey];
                
                if (existingEvents && existingEvents.length > 0) {
                    // Edit existing event
                    showEventModal(day, dateKey, existingEvents[0]);
                } else {
                    // Add new event
                    showEventModal(day, dateKey);
                }
            });
        });
    }
    
    block.querySelector('.cal-prev').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendarView();
    });
    
    block.querySelector('.cal-next').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendarView();
    });
    
    // Initial setup
    attachDateListeners();
    markEventsOnCalendar();
}

// ===== Clock =====
function initClock(block) {
    const clockId = block.dataset.clockId;
    const clockEl = document.getElementById(clockId);
    if (!clockEl) return;
    
    const digitalEl = clockEl.querySelector('.clock-digital');
    const analogEl = clockEl.querySelector('.clock-analog');
    const toggleBtn = clockEl.querySelector('.clock-toggle-btn');
    
    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Digital
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const timeEl = clockEl.querySelector('.clock-time');
        const dateEl = clockEl.querySelector('.clock-date');
        if (timeEl) timeEl.textContent = timeStr;
        if (dateEl) dateEl.textContent = dateStr;
        
        // Analog - rotate hands
        const hourDeg = (hours % 12) * 30 + minutes * 0.5;
        const minDeg = minutes * 6;
        const secDeg = seconds * 6;
        
        const hourHand = clockEl.querySelector('.hour-hand');
        const minHand = clockEl.querySelector('.minute-hand');
        const secHand = clockEl.querySelector('.second-hand');
        
        if (hourHand) hourHand.setAttribute('transform', `rotate(${hourDeg}, 50, 50)`);
        if (minHand) minHand.setAttribute('transform', `rotate(${minDeg}, 50, 50)`);
        if (secHand) secHand.setAttribute('transform', `rotate(${secDeg}, 50, 50)`);
        
        // Check alarm
        if (alarmTime) {
            const currentTime = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
            if (currentTime === alarmTime && seconds === 0) {
                triggerAlarm();
            }
        }
    }
    
    // Toggle button
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const mode = clockEl.dataset.mode;
            if (mode === 'digital') {
                clockEl.dataset.mode = 'analog';
                digitalEl.style.display = 'none';
                analogEl.style.display = 'block';
            } else {
                clockEl.dataset.mode = 'digital';
                digitalEl.style.display = 'block';
                analogEl.style.display = 'none';
            }
        });
    }
    
    // Alarm functionality
    let alarmTime = null;
    const alarmInput = clockEl.querySelector('.alarm-input');
    const alarmSetBtn = clockEl.querySelector('.alarm-set-btn');
    const alarmClearBtn = clockEl.querySelector('.alarm-clear-btn');
    const alarmStatus = clockEl.querySelector('.alarm-status');
    
    function triggerAlarm() {
        alarmStatus.textContent = '🔔 ALARM! Time is up!';
        alarmStatus.classList.add('alarm-ringing');
        
        // Play sound
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAAB/f39/');
            audio.play().catch(() => {});
        } catch(e) {}
        
        // Show notification
        if (Notification.permission === 'granted') {
            new Notification('⏰ Alarm!', { body: `It's ${alarmTime}!` });
        }
        
        // Clear alarm after triggering
        setTimeout(() => {
            alarmTime = null;
            alarmInput.value = '';
            alarmSetBtn.style.display = 'inline-block';
            alarmClearBtn.style.display = 'none';
            alarmStatus.textContent = '';
            alarmStatus.classList.remove('alarm-ringing');
        }, 5000);
    }
    
    if (alarmSetBtn) {
        alarmSetBtn.addEventListener('click', () => {
            const time = alarmInput.value;
            if (time) {
                alarmTime = time;
                alarmStatus.textContent = `⏰ Alarm set for ${time}`;
                alarmSetBtn.style.display = 'none';
                alarmClearBtn.style.display = 'inline-block';
            }
        });
    }
    
    if (alarmClearBtn) {
        alarmClearBtn.addEventListener('click', () => {
            alarmTime = null;
            alarmInput.value = '';
            alarmStatus.textContent = '';
            alarmSetBtn.style.display = 'inline-block';
            alarmClearBtn.style.display = 'none';
        });
    }
    
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// ===== Image Upload =====
function initImageUpload(block) {
    const zone = block.querySelector('.image-upload-zone');
    if (!zone) return;
    
    const placeholder = zone.querySelector('.upload-placeholder');
    const urlInput = zone.querySelector('.image-url-input');
    const loadBtn = zone.querySelector('.load-image-btn');
    const img = zone.querySelector('.block-image');
    
    // Load from URL
    loadBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) loadImage(url);
    });
    
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = urlInput.value.trim();
            if (url) loadImage(url);
        }
    });
    
    // Drag and drop
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-active');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-active'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-active');
        
        // Check for URL in dropped data
        const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        if (url && (url.startsWith('http') || url.startsWith('data:'))) {
            loadImage(url);
            return;
        }
        
        // Check for files
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => loadImage(ev.target.result);
            reader.readAsDataURL(files[0]);
        }
    });
    
    function loadImage(src) {
        img.src = src;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Save image URL to block data
        const blockId = block.dataset.blockId;
        if (blockId && state.dynamicBlocks) {
            const blockData = state.dynamicBlocks.find(b => b.id === blockId);
            if (blockData) {
                blockData.data.imageUrl = src;
                saveState();
            }
        }
    }
    
    // Load saved image if exists
    const blockId = block.dataset.blockId;
    if (blockId && state.dynamicBlocks) {
        const blockData = state.dynamicBlocks.find(b => b.id === blockId);
        if (blockData && blockData.data && blockData.data.imageUrl) {
            loadImage(blockData.data.imageUrl);
        }
    }
}

// ===== Pomodoro Timer =====
function initPomodoro(block) {
    const pomId = block.dataset.pomId;
    const display = document.getElementById(pomId);
    if (!display) return;
    
    let timeLeft = 25 * 60; // seconds
    let isRunning = false;
    let intervalId = null;
    
    const timeEl = display.querySelector('.pom-time');
    const statusEl = display.querySelector('.pom-status');
    const startBtn = display.querySelector('.pom-start');
    const pauseBtn = display.querySelector('.pom-pause');
    const resetBtn = display.querySelector('.pom-reset');
    const modeButtons = display.querySelectorAll('.pom-mode');
    
    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timeEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function tick() {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            // Timer complete - play sound
            clearInterval(intervalId);
            isRunning = false;
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            statusEl.textContent = '🎉 Time is up!';
            
            // Try to play notification sound
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAAB/f39/f39/');
                audio.play().catch(() => {});
            } catch(e) {}
            
            // Show notification if supported
            if (Notification.permission === 'granted') {
                new Notification('🍅 Pomodoro Complete!', { body: 'Time for a break!' });
            }
        }
    }
    
    startBtn.addEventListener('click', () => {
        isRunning = true;
        intervalId = setInterval(tick, 1000);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        statusEl.textContent = '🔥 Focus time...';
    });
    
    pauseBtn.addEventListener('click', () => {
        isRunning = false;
        clearInterval(intervalId);
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        statusEl.textContent = '⏸️ Paused';
    });
    
    resetBtn.addEventListener('click', () => {
        isRunning = false;
        clearInterval(intervalId);
        const activeMode = display.querySelector('.pom-mode.active');
        timeLeft = parseInt(activeMode.dataset.minutes) * 60;
        updateDisplay();
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        statusEl.textContent = 'Ready to focus';
    });
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            isRunning = false;
            clearInterval(intervalId);
            timeLeft = parseInt(btn.dataset.minutes) * 60;
            updateDisplay();
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            statusEl.textContent = btn.dataset.minutes === '25' ? 'Ready to focus' : 'Break time!';
        });
    });
    
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    updateDisplay();
}

// ===== Alarm Block =====
function initAlarmBlock(block) {
    const containerId = block.dataset.alarmBlockId;
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alarmList = container.querySelector('.alarm-list');
    const labelInput = container.querySelector('.alarm-label-input');
    const timeInput = container.querySelector('.new-alarm-time');
    const addBtn = container.querySelector('.add-alarm-btn');
    
    let alarms = [];
    const blockId = block.dataset.blockId;
    
    // Load saved alarms
    if (blockId && state.dynamicBlocks) {
        const blockData = state.dynamicBlocks.find(b => b.id === blockId);
        if (blockData && blockData.data && blockData.data.alarms) {
            alarms = blockData.data.alarms;
            renderAlarms();
        }
    }
    
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    function saveAlarms() {
        if (blockId && state.dynamicBlocks) {
            const blockData = state.dynamicBlocks.find(b => b.id === blockId);
            if (blockData) {
                blockData.data.alarms = alarms;
                saveState();
            }
        }
    }
    
    function renderAlarms() {
        alarmList.innerHTML = alarms.map((alarm, idx) => `
            <div class="alarm-item ${alarm.active ? 'active' : ''}" data-idx="${idx}">
                <div class="alarm-info">
                    <span class="alarm-time-display">${alarm.time}</span>
                    <span class="alarm-label-display">${alarm.label || 'Alarm'}</span>
                </div>
                <div class="alarm-actions">
                    <button class="alarm-toggle" title="${alarm.active ? 'Disable' : 'Enable'}">${alarm.active ? '🔔' : '🔕'}</button>
                    <button class="alarm-delete" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        alarmList.querySelectorAll('.alarm-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.closest('.alarm-item').dataset.idx);
                alarms[idx].active = !alarms[idx].active;
                saveAlarms();
                renderAlarms();
            });
        });
        
        alarmList.querySelectorAll('.alarm-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.closest('.alarm-item').dataset.idx);
                alarms.splice(idx, 1);
                saveAlarms();
                renderAlarms();
            });
        });
    }
    
    // Add new alarm
    addBtn.addEventListener('click', () => {
        const time = timeInput.value;
        const label = labelInput.value.trim() || 'Alarm';
        
        if (time) {
            alarms.push({ time, label, active: true });
            saveAlarms();
            renderAlarms();
            timeInput.value = '';
            labelInput.value = '';
        }
    });
    
    // Check alarms every second
    setInterval(() => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
            
            alarms.forEach((alarm, idx) => {
                if (alarm.active && alarm.time === currentTime && now.getSeconds() === 0) {
                    triggerAlarmSound(alarm.label);
                    // Disable after triggering
                    alarms[idx].active = false;
                    saveAlarms();
                    renderAlarms();
                }
            });
        }, 1000);
    }

    // Global alarm sound function with Windows notification
    function triggerAlarmSound(label = 'Alarm') {
        // Play alarm sound (longer beep pattern)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        function playBeep(startTime) {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    }
    
    // Play beeps for 10 seconds (20 beeps)
    let beepInterval;
    let beepCount = 0;
    
    function startBeeping() {
        playBeep(audioCtx.currentTime);
        beepCount++;
        if (beepCount < 20) {
            beepInterval = setTimeout(startBeeping, 500);
        }
    }
    startBeeping();
    
    // Create stop alarm overlay
    const overlay = document.createElement('div');
    overlay.className = 'alarm-overlay';
    overlay.innerHTML = `
        <div class="alarm-popup">
            <div class="alarm-popup-icon">⏰</div>
            <div class="alarm-popup-label">${label}</div>
            <div class="alarm-popup-text">Alarm is ringing!</div>
            <button class="alarm-stop-btn">Stop Alarm</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Stop alarm function
    function stopAlarm() {
        clearTimeout(beepInterval);
        audioCtx.close();
        overlay.remove();
        document.body.style.animation = '';
    }
    
    overlay.querySelector('.alarm-stop-btn').addEventListener('click', stopAlarm);
    
    // Auto stop after 10 seconds
    setTimeout(stopAlarm, 10000);
    
    // Windows native notification
    if (Notification.permission === 'granted') {
        const notification = new Notification('⏰ ' + label, {
            body: 'Your alarm is ringing! Click to stop.',
            icon: '⏰',
            requireInteraction: true,
            tag: 'alarm-' + Date.now()
        });
        
        notification.onclick = stopAlarm;
        setTimeout(() => notification.close(), 10000);
    }
    
    // Visual alert on page
    document.body.style.animation = 'alarmFlash 0.5s ease infinite';
}

// ===== Content Persistence =====
function initContentPersistence() {
    // Save block titles when edited
    document.querySelectorAll('.block-title').forEach((el, idx) => {
        const block = el.closest('.block');
        const blockId = block?.dataset.day || `block_${idx}`;
        
        el.addEventListener('blur', () => {
            state.blockTitles[blockId] = el.textContent.trim();
            saveState();
        });
    });
    
    // Save course list items
    document.querySelectorAll('.simple-list li').forEach((li, idx) => {
        const emojiEl = li.querySelector('.emoji');
        const textEl = li.querySelector('span[contenteditable]');
        
        if (emojiEl) {
            emojiEl.setAttribute('contenteditable', 'true');
            emojiEl.style.outline = 'none';
            emojiEl.addEventListener('blur', () => {
                if (!state.courses[idx]) state.courses[idx] = { emoji: '', text: '' };
                state.courses[idx].emoji = emojiEl.textContent.trim();
                saveState();
            });
        }
        
        if (textEl) {
            textEl.addEventListener('blur', () => {
                if (!state.courses[idx]) state.courses[idx] = { emoji: '', text: '' };
                state.courses[idx].text = textEl.textContent.trim();
                saveState();
            });
        }
    });
    
    // Save Courses block title
    const coursesTitle = document.querySelector('.list-block .block-title');
    if (coursesTitle) {
        coursesTitle.addEventListener('blur', () => {
            state.blockTitles['courses'] = coursesTitle.textContent.trim();
            saveState();
        });
    }
}

function loadSavedContent() {
    // Load block titles
    document.querySelectorAll('.block-title').forEach((el, idx) => {
        const block = el.closest('.block');
        const blockId = block?.dataset.day || `block_${idx}`;
        
        if (state.blockTitles[blockId]) {
            el.textContent = state.blockTitles[blockId];
        }
    });
    
    // Load Courses block title
    const coursesTitle = document.querySelector('.list-block .block-title');
    if (coursesTitle && state.blockTitles['courses']) {
        coursesTitle.textContent = state.blockTitles['courses'];
    }
    
    // Load course list items
    document.querySelectorAll('.simple-list li').forEach((li, idx) => {
        if (state.courses[idx]) {
            const emojiEl = li.querySelector('.emoji');
            const textEl = li.querySelector('span[contenteditable]');
            
            if (emojiEl && state.courses[idx].emoji) {
                emojiEl.textContent = state.courses[idx].emoji;
            }
            if (textEl && state.courses[idx].text) {
                textEl.textContent = state.courses[idx].text;
            }
        }
    });
}

// Utilities
function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}
