/**
 * Dashboard Component v2.0
 * Компонент дашборда
 */

const Dashboard = {
    /**
     * Инициализация дашборда
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Рендер дашборда
     */
    render() {
        this.updateDate();
        this.updateGreeting();
        this.updateStats();
        this.updateLevelProgress();
        this.renderActiveTasks();
        this.updateDailyQuest();
        
        // Рендер цитаты дня
        if (typeof Motivation !== 'undefined') {
            Motivation.showDailyQuote();
        }
    },

    /**
     * Обновление даты
     */
    updateDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const today = new Date();
            const dateStr = today.toLocaleDateString('ru-RU', options);
            // Первая буква заглавная
            dateEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        }
    },

    /**
     * Обновление приветствия
     */
    updateGreeting() {
        const hour = new Date().getHours();
        const emojiEl = document.getElementById('greeting-emoji');
        const titleEl = document.getElementById('greeting-title');
        const subtitleEl = document.getElementById('greeting-subtitle');

        let greeting, emoji, subtitle;

        if (hour >= 5 && hour < 12) {
            greeting = Motivation ? Motivation.getMorningGreeting() : 'Доброе утро!';
            emoji = '🌅';
            subtitle = 'Начни день с победы!';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Добрый день!';
            emoji = '☀️';
            subtitle = 'Продолжай в том же духе!';
        } else if (hour >= 17 && hour < 23) {
            greeting = 'Добрый вечер!';
            emoji = '🌆';
            subtitle = 'Заверши день продуктивно!';
        } else {
            greeting = 'Доброй ночи!';
            emoji = '🌙';
            subtitle = 'Работаешь ночью? Уважаю!';
        }

        if (emojiEl) emojiEl.textContent = emoji;
        if (titleEl) titleEl.textContent = greeting;
        if (subtitleEl) subtitleEl.textContent = subtitle;
    },

    /**
     * Обновление статистики
     */
    updateStats() {
        const profile = Storage.getProfile();
        if (!profile) return;

        const streakValue = document.getElementById('streak-value');
        const xpToday = document.getElementById('xp-today');
        const tasksDoneToday = document.getElementById('tasks-done-today');
        const tasksActive = document.getElementById('tasks-active');

        if (streakValue) streakValue.textContent = profile.streak;
        if (xpToday) xpToday.textContent = Storage.getXpToday();
        if (tasksDoneToday) tasksDoneToday.textContent = Storage.getTasksDoneToday();
        if (tasksActive) tasksActive.textContent = Storage.getActiveTasks().length;
    },

    /**
     * Обновление прогресса уровня
     */
    updateLevelProgress() {
        const profile = Storage.getProfile();
        if (!profile) return;

        Profile.updateNavLevel(profile);
    },

    /**
     * Рендер активных задач
     */
    renderActiveTasks() {
        const container = document.getElementById('active-tasks-list');
        if (!container) return;

        const tasks = Storage.getActiveTasks().slice(0, 5); // Показываем только 5

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">Нет активных задач</p>
                    <button class="btn-submit" onclick="Modal.openTaskModal()">
                        + Создать задачу
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        tasks.forEach(task => {
            const card = Card.create(task, true); // compact mode
            container.appendChild(card);
        });
    },

    /**
     * Обновление ежедневного квеста
     */
    updateDailyQuest() {
        const dailyQuest = Storage.getDailyQuest();
        if (!dailyQuest) return;

        const fill = document.getElementById('daily-quest-fill');
        const text = document.getElementById('daily-quest-text');

        if (fill && text) {
            const percent = (dailyQuest.progress / dailyQuest.target) * 100;
            fill.style.width = `${percent}%`;
            text.textContent = `${dailyQuest.progress}/${dailyQuest.target}`;

            if (dailyQuest.completed) {
                fill.style.background = 'linear-gradient(90deg, var(--success), #34d399)';
            }
        }
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Кнопки добавления задачи
        const addTaskBtns = document.querySelectorAll('#add-task-btn, #fab-add-task');
        addTaskBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                Modal.openTaskModal();
            });
        });

        // Быстрые действия
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                Modal.openTaskModal();
                // Предвыбор категории
                setTimeout(() => {
                    const select = document.getElementById('task-type');
                    if (select) select.value = type;
                }, 100);
            });
        });

        // Делегирование событий для карточек на дашборде
        const container = document.getElementById('active-tasks-list');
        if (container) {
            container.addEventListener('click', (e) => {
                const card = e.target.closest('.task-card');
                if (!card) return;

                const actionBtn = e.target.closest('[data-action]');
                if (actionBtn) {
                    const action = actionBtn.dataset.action;
                    const taskId = card.dataset.id;

                    switch (action) {
                        case 'complete':
                            App.completeTask(taskId);
                            break;
                        case 'edit':
                            App.editTask(taskId);
                            break;
                        case 'delete':
                            App.deleteTask(taskId);
                            break;
                    }
                }
            });
        }
    },

    /**
     * Обновить статистику после выполнения задачи
     */
    updateAfterTaskComplete() {
        this.updateStats();
        this.updateLevelProgress();
        this.renderActiveTasks();
        this.updateDailyQuest();
    }
};
