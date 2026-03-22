/**
 * Deck Component v2.0
 * Компонент колоды задач
 */

const Deck = {
    currentFilter: 'all',
    currentSort: 'date',

    /**
     * Инициализация колоды
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Рендер колоды
     */
    render(filter = 'all', sort = 'date') {
        this.currentFilter = filter;
        this.currentSort = sort;
        const container = document.getElementById('deck-list');
        if (!container) return;

        let tasks = Storage.getTasks();

        // Фильтрация
        if (filter !== 'all') {
            tasks = tasks.filter(t => t.type === filter);
        }

        // Сортировка
        tasks = this.sortTasks(tasks, sort);

        // Обновляем статистику колоды
        this.updateDeckStats();

        if (tasks.length === 0) {
            container.innerHTML = this.renderEmpty();
            return;
        }

        container.innerHTML = '';
        tasks.forEach(task => {
            const card = Card.create(task, false);
            container.appendChild(card);
        });

        // Обновляем активный фильтр
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Обновляем активную сортировку
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === sort);
        });
    },

    /**
     * Сортировка задач
     */
    sortTasks(tasks, sort) {
        switch (sort) {
            case 'xp':
                return tasks.sort((a, b) => {
                    if (a.status === 'active' && b.status === 'done') return -1;
                    if (a.status === 'done' && b.status === 'active') return 1;
                    return b.xp - a.xp;
                });
            case 'difficulty':
                return tasks.sort((a, b) => {
                    if (a.status === 'active' && b.status === 'done') return -1;
                    if (a.status === 'done' && b.status === 'active') return 1;
                    return b.difficulty - a.difficulty;
                });
            case 'date':
            default:
                return tasks.sort((a, b) => {
                    if (a.status === 'active' && b.status === 'done') return -1;
                    if (a.status === 'done' && b.status === 'active') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
        }
    },

    /**
     * Обновление статистики колоды
     */
    updateDeckStats() {
        const tasks = Storage.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;

        const totalEl = document.getElementById('deck-total');
        const completedEl = document.getElementById('deck-completed');

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
    },

    /**
     * Пустое состояние
     */
    renderEmpty() {
        const messages = {
            all: {
                icon: '📇',
                text: 'В колоде пока нет задач. Создайте первую!'
            },
            study: {
                icon: '📚',
                text: 'Нет учебных задач. Добавьте что-то новое!'
            },
            sport: {
                icon: '💪',
                text: 'Нет спортивных задач. Время для тренировки!'
            },
            creative: {
                icon: '🎨',
                text: 'Нет творческих задач. Раскройте креативность!'
            },
            other: {
                icon: '📝',
                text: 'Нет других задач. Добавьте задачу!'
            }
        };

        const msg = messages[this.currentFilter] || messages.all;

        return `
            <div class="empty-state">
                <div class="empty-state-icon">${msg.icon}</div>
                <p class="empty-state-text">${msg.text}</p>
                <button class="btn-submit" onclick="Modal.openTaskModal()">
                    + Создать задачу
                </button>
            </div>
        `;
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Фильтры
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.render(e.target.dataset.filter, this.currentSort);
            });
        });

        // Сортировка
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.render(this.currentFilter, e.target.dataset.sort);
            });
        });

        // Делегирование событий для карточек
        const container = document.getElementById('deck-list');
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
     * Обновить карточку
     */
    updateCard(taskId, task) {
        this.render(this.currentFilter, this.currentSort);
    },

    /**
     * Добавить карточку
     */
    addCard(task) {
        this.render(this.currentFilter, this.currentSort);
    },

    /**
     * Удалить карточку
     */
    removeCard(taskId) {
        this.render(this.currentFilter, this.currentSort);
    },

    /**
     * Получить текущий фильтр
     */
    getCurrentFilter() {
        return this.currentFilter;
    }
};
