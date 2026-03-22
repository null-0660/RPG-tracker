/**
 * Habits Component v2.0
 * Система привычек для LifeRPG
 * Помогает формировать полезные ежедневные ритуалы
 */

const Habits = {
    /**
     * Инициализация
     */
    init() {
        // Проверка инициализации
        if (!this.habits) {
            this.habits = [];
        }
        
        this.loadHabits();
        this.checkDailyReset();
        this.render();
        this.bindEvents();
    },

    /**
     * Загрузка привычек из хранилища
     */
    loadHabits() {
        const habits = localStorage.getItem('liferpg_habits_v2');
        if (!habits) {
            // Создаём привычки по умолчанию
            this.defaultHabits = [
                {
                    id: 'habit_water',
                    title: '💧 Пить воду утром',
                    description: 'Стакан воды сразу после пробуждения',
                    category: 'health',
                    xpReward: 10,
                    streak: 0,
                    completedToday: false,
                    lastCompleted: null,
                    priority: 'high'
                },
                {
                    id: 'habit_exercise',
                    title: '💪 Утренняя зарядка',
                    description: '10-15 минут лёгкой разминки',
                    category: 'sport',
                    xpReward: 25,
                    streak: 0,
                    completedToday: false,
                    lastCompleted: null,
                    priority: 'high'
                },
                {
                    id: 'habit_read',
                    title: '📚 Читать 20 минут',
                    description: 'Чтение полезной литературы',
                    category: 'study',
                    xpReward: 20,
                    streak: 0,
                    completedToday: false,
                    lastCompleted: null,
                    priority: 'medium'
                },
                {
                    id: 'habit_meditate',
                    title: '🧘 Медитация 10 минут',
                    description: 'Практика осознанности и дыхания',
                    category: 'health',
                    xpReward: 15,
                    streak: 0,
                    completedToday: false,
                    lastCompleted: null,
                    priority: 'medium'
                },
                {
                    id: 'habit_plan',
                    title: '📝 Планировать день',
                    description: 'Составление плана на предстоящий день',
                    category: 'other',
                    xpReward: 15,
                    streak: 0,
                    completedToday: false,
                    lastCompleted: null,
                    priority: 'high'
                },
                {
                    id: 'habit_sleep',
                    title: '😴 Ложиться до 23:00',
                    description: 'Здоровый сон для восстановления',
                    category: 'health',
                    xpReward: 20,
                    streak: 0,
                    completedToday: false,
                    lastCompleted: null,
                    priority: 'high'
                }
            ];
            this.saveHabits(this.defaultHabits);
        } else {
            this.habits = JSON.parse(habits);
        }
    },

    /**
     * Сохранение привычек
     */
    saveHabits(habits) {
        localStorage.setItem('liferpg_habits_v2', JSON.stringify(habits));
        this.habits = habits;
    },

    /**
     * Проверка ежедневного сброса
     */
    checkDailyReset() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('liferpg_habits_last_reset');

        if (lastReset !== today) {
            // Сбрасываем completedToday для всех привычек
            this.habits.forEach(habit => {
                habit.completedToday = false;
            });
            this.saveHabits(this.habits);
            localStorage.setItem('liferpg_habits_last_reset', today);
        }
    },

    /**
     * Рендер привычек
     */
    render() {
        const container = document.getElementById('habits-list');
        if (!container) return;

        const today = new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        // Заголовок с датой
        const headerHtml = `
            <div class="habits-header">
                <h3>📅 Привычки на ${today.charAt(0).toUpperCase() + today.slice(1)}</h3>
                <button class="btn-add-habit" id="add-habit-btn" aria-label="Добавить привычку">
                    <span>+</span>
                </button>
            </div>
        `;

        // Группировка по приоритету
        const highPriority = this.habits.filter(h => h.priority === 'high');
        const mediumPriority = this.habits.filter(h => h.priority === 'medium');
        const lowPriority = this.habits.filter(h => h.priority === 'low');

        const renderHabitList = (habits) => {
            if (habits.length === 0) return '';
            
            return habits.map(habit => `
                <div class="habit-card ${habit.completedToday ? 'completed' : ''}" data-id="${habit.id}">
                    <div class="habit-header">
                        <div class="habit-info">
                            <h4>${habit.title}</h4>
                            <p>${habit.description}</p>
                        </div>
                        <button class="habit-complete-btn ${habit.completedToday ? 'done' : ''}" 
                                data-id="${habit.id}" 
                                aria-label="${habit.completedToday ? 'Отменить' : 'Выполнить'}">
                            ${habit.completedToday ? '✅' : '⬜'}
                        </button>
                    </div>
                    <div class="habit-meta">
                        <span class="habit-streak">🔥 ${habit.streak} дн.</span>
                        <span class="habit-xp">✨ ${habit.xpReward} XP</span>
                        <span class="habit-category">${this.getCategoryIcon(habit.category)} ${this.getCategoryName(habit.category)}</span>
                    </div>
                    ${habit.streak > 0 ? `
                        <div class="habit-streak-bar">
                            <div class="habit-streak-fill" style="width: ${Math.min(100, habit.streak * 10)}%"></div>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        };

        container.innerHTML = headerHtml + `
            ${highPriority.length > 0 ? `
                <div class="habits-group">
                    <div class="habits-group-title">🔴 Высокий приоритет</div>
                    ${renderHabitList(highPriority)}
                </div>
            ` : ''}
            
            ${mediumPriority.length > 0 ? `
                <div class="habits-group">
                    <div class="habits-group-title">🟡 Средний приоритет</div>
                    ${renderHabitList(mediumPriority)}
                </div>
            ` : ''}
            
            ${lowPriority.length > 0 ? `
                <div class="habits-group">
                    <div class="habits-group-title">🟢 Низкий приоритет</div>
                    ${renderHabitList(lowPriority)}
                </div>
            ` : ''}
            
            ${this.habits.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">🌱</div>
                    <p class="empty-state-text">Нет привычек. Добавьте первую!</p>
                </div>
            ` : ''}
        `;

        this.bindHabitEvents();
    },

    /**
     * Привязка событий для привычек
     */
    bindHabitEvents() {
        // Кнопки выполнения
        document.querySelectorAll('.habit-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const habitId = e.currentTarget.dataset.id;
                this.toggleHabit(habitId);
            });
        });

        // Кнопка добавления
        const addBtn = document.getElementById('add-habit-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.openAddHabitModal();
            });
        }
    },

    /**
     * Переключение выполнения привычки
     */
    toggleHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const profile = Storage.getProfile();
        const today = new Date().toDateString();

        if (habit.completedToday) {
            // Отмена выполнения
            habit.completedToday = false;
            habit.lastCompleted = null;
            // Не отменяем стрик при отмене
        } else {
            // Выполнение
            habit.completedToday = true;
            habit.lastCompleted = today;
            habit.streak++;

            // Награда XP
            profile.totalXp += habit.xpReward;
            profile.xp += habit.xpReward;

            // Проверка уровня
            const newLevel = Storage.calculateLevel(profile.xp);
            if (newLevel > profile.level) {
                profile.level = newLevel;
                App.showNotification(`🎉 Уровень повышен: ${newLevel}!`, 'success');
            }

            // Бонус за серию
            if (habit.streak === 7) {
                profile.gold += 50;
                App.showNotification('🏆 Недельная серия! +50 💰', 'success');
            } else if (habit.streak === 30) {
                profile.gold += 200;
                App.showNotification('🏆 Месячная серия! +200 💰', 'success');
            }

            // Обновляем статистику привычек
            if (typeof Statistics !== 'undefined') {
                Statistics.onHabitComplete(habit);
            }
        }

        Storage.saveProfile(profile);
        this.saveHabits(this.habits);
        this.render();
        Dashboard.render();

        if (!habit.completedToday) {
            App.showNotification(`+${habit.xpReward} XP | Привычка выполнена!`, 'success');
        }
    },

    /**
     * Открыть модалку добавления привычки
     */
    openAddHabitModal() {
        const modal = document.getElementById('habit-modal');
        if (!modal) return;

        modal.classList.add('active');
    },

    /**
     * Закрыть модалку добавления привычки
     */
    closeAddHabitModal() {
        const modal = document.getElementById('habit-modal');
        if (!modal) return;

        modal.classList.remove('active');
    },

    /**
     * Добавить новую привычку
     */
    addHabit(formData) {
        const newHabit = {
            id: 'habit_' + Date.now(),
            title: formData.title,
            description: formData.description,
            category: formData.category,
            xpReward: parseInt(formData.xpReward) || 15,
            streak: 0,
            completedToday: false,
            lastCompleted: null,
            priority: formData.priority
        };

        this.habits.push(newHabit);
        this.saveHabits(this.habits);
        this.render();
        App.showNotification('🌱 Привычка добавлена!', 'success');
        this.closeAddHabitModal();
    },

    /**
     * Удалить привычку
     */
    deleteHabit(habitId) {
        if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits(this.habits);
            this.render();
            App.showNotification('Привычка удалена', 'info');
        }
    },

    /**
     * Получить иконку категории
     */
    getCategoryIcon(category) {
        const icons = {
            health: '💚',
            sport: '💪',
            study: '📚',
            creative: '🎨',
            other: '📝'
        };
        return icons[category] || '📝';
    },

    /**
     * Получить название категории
     */
    getCategoryName(category) {
        const names = {
            health: 'Здоровье',
            sport: 'Спорт',
            study: 'Учёба',
            creative: 'Творчество',
            other: 'Другое'
        };
        return names[category] || 'Другое';
    },

    /**
     * Привязка глобальных событий
     */
    bindEvents() {
        // Обработка формы добавления привычки
        const form = document.getElementById('habit-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                this.addHabit({
                    title: formData.get('habit-title'),
                    description: formData.get('habit-description'),
                    category: formData.get('habit-category'),
                    xpReward: formData.get('habit-xp'),
                    priority: formData.get('habit-priority')
                });
            });
        }

        // Закрытие модалки
        const closeBtn = document.getElementById('habit-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeAddHabitModal();
            });
        }

        // Закрытие по клику вне модалки
        const overlay = document.getElementById('habit-modal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAddHabitModal();
                }
            });
        }
    },

    /**
     * Получить общую статистику привычек
     */
    getStats() {
        const total = this.habits.length;
        const completedToday = this.habits.filter(h => h.completedToday).length;
        const totalStreak = this.habits.reduce((sum, h) => sum + h.streak, 0);
        const bestStreak = Math.max(...this.habits.map(h => h.streak), 0);

        return {
            total,
            completedToday,
            totalStreak,
            bestStreak,
            completionRate: total > 0 ? Math.round((completedToday / total) * 100) : 0
        };
    }
};
