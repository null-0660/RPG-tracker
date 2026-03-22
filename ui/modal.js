/**
 * Modal Component v2.0
 * Компонент модальных окон
 */

const Modal = {
    currentTaskId: null,

    /**
     * Инициализация
     */
    init() {
        this.bindEvents();
    },

    /**
     * Открыть модалку задачи
     */
    openTaskModal(taskId = null) {
        const modal = document.getElementById('task-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('task-form');

        this.currentTaskId = taskId;

        if (taskId) {
            // Редактирование
            const task = Storage.getTask(taskId);
            if (task) {
                title.textContent = 'Редактировать задачу';
                this.fillForm(task);
            }
        } else {
            // Создание
            title.textContent = 'Новая задача';
            this.clearForm();
        }

        modal.classList.add('active');
    },

    /**
     * Закрыть модалку задачи
     */
    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        modal.classList.remove('active');
        this.currentTaskId = null;
    },

    /**
     * Заполнить форму данными задачи
     */
    fillForm(task) {
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-purpose').value = task.purpose || '';
        document.getElementById('task-benefit').value = task.benefit || '';
        document.getElementById('task-type').value = task.type;
        document.getElementById('task-difficulty').value = task.difficulty;
        document.getElementById('task-duration').value = task.duration;
        document.getElementById('task-xp').value = task.xp;

        // Подзадачи
        const subtasksList = document.getElementById('subtasks-list');
        subtasksList.innerHTML = '';
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => {
                this.addSubtaskField(subtask.title);
            });
        }
    },

    /**
     * Очистить форму
     */
    clearForm() {
        document.getElementById('task-form').reset();
        document.getElementById('task-id').value = '';
        document.getElementById('subtasks-list').innerHTML = '';
    },

    /**
     * Добавить поле подзадачи
     */
    addSubtaskField(value = '') {
        const subtasksList = document.getElementById('subtasks-list');
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';
        subtaskItem.innerHTML = `
            <input type="text" placeholder="Подзадача..." value="${this.escapeHtml(value)}">
            <button type="button" onclick="Modal.removeSubtask(this)" aria-label="Удалить подзадачу">✕</button>
        `;
        subtasksList.appendChild(subtaskItem);
    },

    /**
     * Удалить поле подзадачи
     */
    removeSubtask(button) {
        button.parentElement.remove();
    },

    /**
     * Получить данные из формы
     */
    getFormData() {
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const purpose = document.getElementById('task-purpose').value;
        const benefit = document.getElementById('task-benefit').value;
        const type = document.getElementById('task-type').value;
        const difficulty = document.getElementById('task-difficulty').value;
        const duration = document.getElementById('task-duration').value;
        const xp = document.getElementById('task-xp').value;

        // Подзадачи
        const subtasks = [];
        document.querySelectorAll('.subtask-item input').forEach(input => {
            if (input.value.trim()) {
                subtasks.push({
                    id: Date.now() + Math.random(),
                    title: input.value.trim(),
                    completed: false
                });
            }
        });

        return {
            id: id || Date.now().toString(),
            title,
            description,
            purpose,
            benefit,
            type,
            difficulty: parseInt(difficulty),
            duration: parseInt(duration),
            xp: parseInt(xp) || parseInt(difficulty) * 10,
            subtasks
        };
    },

    /**
     * Открыть модалку выполнения
     */
    openCompleteModal(task) {
        const modal = document.getElementById('complete-modal');
        const xpGain = document.getElementById('xp-gain');
        const taskTitle = document.getElementById('complete-task-title');
        const statGains = document.getElementById('stat-gains');

        const xpMultiplier = Storage.getXpMultiplier();
        const finalXp = Math.floor(task.xp * xpMultiplier);

        xpGain.textContent = finalXp;
        taskTitle.textContent = task.title;

        // Показываем полученные характеристики
        const statGain = Math.floor(task.xp / 20);
        const statType = this.getStatType(task.type);
        const statIcons = {
            intellect: '🧠',
            strength: '💪',
            creative: '🎨',
            luck: '🍀'
        };
        const statNames = {
            intellect: 'Интеллект',
            strength: 'Сила',
            creative: 'Креатив',
            luck: 'Удача'
        };

        let statsHtml = `
            <div class="stat-gain-item">
                ${statIcons[statType]} +${statGain} ${statNames[statType]}
            </div>
        `;

        // Показываем активные бустеры
        const boosters = Storage.checkActiveBoosters();
        if (boosters.length > 0) {
            statsHtml += '<div class="booster-active">⚡ Бустер активен!</div>';
        }

        statGains.innerHTML = statsHtml;

        modal.classList.add('active');
    },

    /**
     * Закрыть модалку выполнения
     */
    closeCompleteModal() {
        const modal = document.getElementById('complete-modal');
        modal.classList.remove('active');
    },

    /**
     * Получить тип характеристики по типу задачи
     */
    getStatType(taskType) {
        const mapping = {
            study: 'intellect',
            sport: 'strength',
            creative: 'creative',
            other: 'intellect'
        };
        return mapping[taskType] || 'intellect';
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Закрытие модалок
        const closeBtns = document.querySelectorAll('.modal-close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeTaskModal();
                this.closeCompleteModal();
                document.getElementById('use-item-modal')?.classList.remove('active');
            });
        });

        // Кнопка отмены
        const cancelBtn = document.getElementById('btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeTaskModal();
            });
        }

        // Форма задачи
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Добавление подзадачи
        const addSubtaskBtn = document.getElementById('add-subtask-btn');
        if (addSubtaskBtn) {
            addSubtaskBtn.addEventListener('click', () => {
                this.addSubtaskField();
            });
        }

        // Закрытие по клику вне модалки
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeTaskModal();
                    this.closeCompleteModal();
                    document.getElementById('use-item-modal')?.classList.remove('active');
                }
            });
        });

        // Подтверждение выполнения
        const confirmCompleteBtn = document.getElementById('btn-confirm-complete');
        if (confirmCompleteBtn) {
            confirmCompleteBtn.addEventListener('click', () => {
                this.closeCompleteModal();
                if (this.currentTaskId) {
                    App.finalizeTaskCompletion(this.currentTaskId);
                }
            });
        }

        // Закрытие модалки предмета по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    },

    /**
     * Обработка отправки формы
     */
    handleSubmit() {
        const formData = this.getFormData();

        if (!formData.title.trim()) {
            App.showNotification('Введите название задачи!', 'error');
            return;
        }

        if (this.currentTaskId) {
            // Редактирование
            const existingTask = Storage.getTask(this.currentTaskId);
            if (existingTask) {
                const updatedTask = {
                    ...existingTask,
                    ...formData
                };
                Storage.updateTask(this.currentTaskId, updatedTask);
                App.showNotification('Задача обновлена!', 'success');

                // Обновляем UI
                if (Deck.getCurrentFilter() === 'all' || Deck.getCurrentFilter() === formData.type) {
                    Deck.updateCard(this.currentTaskId, updatedTask);
                }
                Dashboard.renderActiveTasks();
            }
        } else {
            // Создание новой
            const newTask = {
                ...formData,
                level: 1,
                status: 'active',
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            Storage.addTask(newTask);
            App.showNotification('Задача создана!', 'success');

            // Обновляем статистику
            if (typeof Statistics !== 'undefined') {
                Statistics.onTaskCreate(newTask);
            }

            // Обновляем UI
            Deck.addCard(newTask);
            Dashboard.renderActiveTasks();
        }

        this.closeTaskModal();
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
