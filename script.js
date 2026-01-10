/**
 * Green Home - Notion Clone with Themes + Calendar
 * Features: Theme-specific images, calendar, draggable blocks, todos
 */

const STORAGE_KEY = 'greenHomeBlocks';
let state = { todos: {}, theme: 'green', pageTitle: '🌿 Green Home', customTitle: false };

const DEFAULT_TODOS = {
    monday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    tuesday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    wednesday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    thursday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    friday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    saturday: [{ time: '09:00', text: 'Physics', done: false }, { time: '11:00', text: "Math's", done: false }, { time: '13:00', text: 'Chemistry', done: false }, { time: '15:00', text: 'React JS', done: false }],
    sunday: [{ time: '09:00', text: 'Test Phy', done: false }, { time: '11:00', text: 'Test Chem', done: false }, { time: '13:00', text: 'Test Maths', done: false }]
};

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
    console.log('🌿 Green Home loaded!');
});

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        state = JSON.parse(saved);
    } else {
        state = { todos: JSON.parse(JSON.stringify(DEFAULT_TODOS)), theme: 'green', pageTitle: '🌿 Green Home', customTitle: false };
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    
    // Block dragging
    let draggedBlock = null;
    document.querySelectorAll('.block').forEach(block => {
        const dragBtn = block.querySelector('.drag-block-btn');
        if (dragBtn) {
            dragBtn.addEventListener('mousedown', () => block.setAttribute('draggable', true));
            dragBtn.addEventListener('mouseup', () => block.setAttribute('draggable', false));
        }
        block.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('todo-item')) return;
            draggedBlock = block;
            block.classList.add('dragging');
        });
        block.addEventListener('dragend', () => {
            block.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            draggedBlock = null;
        });
        block.addEventListener('dragover', (e) => {
            if (!draggedBlock || draggedBlock === block) return;
            e.preventDefault();
            block.classList.add('drag-over');
        });
        block.addEventListener('dragleave', () => block.classList.remove('drag-over'));
        block.addEventListener('drop', (e) => {
            if (!draggedBlock || draggedBlock === block) return;
            e.preventDefault();
            block.classList.remove('drag-over');
            block.parentElement.insertBefore(draggedBlock, block);
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
            createNewBlock(opt.dataset.type);
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

function createNewBlock(type) {
    const block = document.createElement('div');
    block.className = 'block';
    block.draggable = true;
    block.dataset.blockType = type;
    
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
        case 'image':
            block.classList.add('image-block');
            content = `<img src="themes/${state.theme}/sidebar.png" class="block-image" alt="Image">`;
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
    
    if (currentInsertAfter) {
        currentInsertAfter.after(block);
    } else {
        const todoGrid = document.querySelector('.todo-grid');
        if (todoGrid) todoGrid.appendChild(block);
    }
    
    block.querySelector('.delete-block-btn').addEventListener('click', () => {
        if (confirm('Delete this block?')) {
            const day = block.dataset.day;
            if (day) delete state.todos[day];
            block.remove();
            saveState();
        }
    });
    
    block.querySelector('.add-block-btn').addEventListener('click', (e) => showBlockMenu(e, block));
    
    if (type === 'todo') renderTodosForBlock(block);
    if (type === 'calendar') initCalendarNav(block);
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
    
    block.querySelector('.cal-prev').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        monthEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        gridEl.innerHTML = generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth());
    });
    
    block.querySelector('.cal-next').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        monthEl.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        gridEl.innerHTML = generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth());
    });
}

// Utilities
function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}
