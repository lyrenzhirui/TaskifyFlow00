// 初始化任务数组和DOM元素
let // 迁移旧数据时间格式
tasks = (JSON.parse(localStorage.getItem('tasks')) || []).map(task => ({
  ...task,
  createdAt: formatLegacyTime(task.createdAt),
  completedAt: task.completedAt ? formatLegacyTime(task.completedAt) : null
}));

function formatLegacyTime(timeStr) {
  if (/\d{1,2}:\d{2}:\d{2}/.test(timeStr)) {
    return new Date(timeStr).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[\/]/g, '-');
  }
  return timeStr;
}
const taskContainer = document.getElementById('taskContainer');

// 初始化事件监听
function init() {
    document.getElementById('addBtn').addEventListener('click', createNewTask);
    document.getElementById('delBtn').addEventListener('click', deleteCompletedTasks);
    document.getElementById('exportBtn').addEventListener('click', exportTasks);
    document.getElementById('clearBtn').addEventListener('click', clearAllTasks);
    renderTasks();
}

// 创建新任务
function createNewTask() {
    const newTask = {
        id: Date.now(),
        content: '',
        createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[\/]/g, '-'),
        completed: false,
        completedAt: null
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

// 渲染所有任务
function renderTasks() {
    taskContainer.innerHTML = '';
    tasks.forEach(task => {
        const taskEl = createTaskElement(task);
        taskContainer.appendChild(taskEl);
    });
}

// 创建单个任务元素
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `sticky-note ${task.completed ? 'completed' : ''}`;
    div.dataset.id = task.id;
    div.style = `--hue: ${Math.floor(Math.random() * 360)}`;

    const textarea = document.createElement('textarea');
    textarea.placeholder = '输入任务内容...';
    textarea.value = task.content;
    textarea.addEventListener('input', (e) => {
        task.content = e.target.value;
        saveTasks();
    });

    const metaDiv = document.createElement('div');
    metaDiv.className = 'task-meta';
    metaDiv.innerHTML = `
        <div class="task-created">📅 ${task.createdAt}</div>
        <div class="task-completed">${task.completed ? '✅ ' + task.completedAt : ''}</div>
    `;

    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', (e) => {
        task.completed = e.target.checked;
        task.completedAt = task.completed ? new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[\/]/g, '-') : null;
        div.classList.toggle('completed');
        metaDiv.innerHTML = `
    <div class="task-created">📅 ${task.createdAt}</div>
    ${task.completed ? `<div class="task-completed">✅ ${task.completedAt}</div>` : ''}
`;
        saveTasks();
    });

    const label = document.createElement('label');
    label.textContent = '已完成';

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    div.appendChild(textarea);
    div.appendChild(checkboxContainer);
    div.appendChild(metaDiv);

    return div;
}

// 删除已完成任务
function deleteCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// 保存到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 导出任务为TXT
function exportTasks() {
    const timestamp = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[\/]/g, '').replace(/[^0-9]/g, '');
    const content = tasks.map(task => 
        `任务ID：${task.id}
内容：${task.content || '（空）'}
创建时间：${task.createdAt}
完成状态：${task.completed ? '✅ ' + task.completedAt : '未完成'}
${'-'.repeat(30)}`
    ).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// 清空全部任务
function clearAllTasks() {
    if (confirm('⚠️ 确定要清空所有任务吗？此操作不可恢复！')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);