/**
 * Pomodoro Component v2.1
 * Таймер Pomodoro для LifeRPG
 * Помогает фокусироваться на задачах (25 мин работа + 5 мин отдых)
 */

const Pomodoro = {
    // Конфигурация
    config: {
        workTime: 25 * 60, // 25 минут в секундах
        shortBreak: 5 * 60, // 5 минут
        longBreak: 15 * 60, // 15 минут
        sessionsBeforeLongBreak: 4
    },

    // Состояние
    state: {
        isRunning: false,
        isPaused: false,
        mode: 'work', // 'work', 'shortBreak', 'longBreak'
        timeLeft: 25 * 60,
        sessionsCompleted: 0,
        totalSessionsToday: 0,
        currentTaskId: null,
        timerInterval: null
    },

    /**
     * Инициализация
     */
    init() {
        // Проверка инициализации состояния
        if (!this.state) {
            this.state = {
                isRunning: false,
                isPaused: false,
                mode: 'work',
                timeLeft: 25 * 60,
                sessionsCompleted: 0,
                totalSessionsToday: 0,
                currentTaskId: null,
                timerInterval: null
            };
        }
        
        this.loadState();
        this.render();
        this.bindEvents();
    },

    /**
     * Загрузка состояния
     */
    loadState() {
        const saved = localStorage.getItem('liferpg_pomodoro_v2');
        if (saved) {
            const data = JSON.parse(saved);
            // Проверяем, не прошёл ли день
            const today = new Date().toDateString();
            if (data.lastDate === today) {
                this.state.totalSessionsToday = data.totalSessionsToday || 0;
            }
        }
    },

    /**
     * Сохранение состояния
     */
    saveState() {
        localStorage.setItem('liferpg_pomodoro_v2', JSON.stringify({
            totalSessionsToday: this.state.totalSessionsToday,
            lastDate: new Date().toDateString()
        }));
    },

    /**
     * Рендер таймера
     */
    render() {
        const container = document.getElementById('pomodoro-timer');
        if (!container) return;

        // Проверка инициализации
        if (!this.config) {
            this.config = {
                workTime: 25 * 60,
                shortBreak: 5 * 60,
                longBreak: 15 * 60,
                sessionsBeforeLongBreak: 4
            };
        }

        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;
        const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const modeLabels = {
            work: '🍅 Работа',
            shortBreak: '☕ Короткий перерыв',
            longBreak: '🌟 Длинный перерыв'
        };

        const modeColors = {
            work: 'var(--accent-primary)',
            shortBreak: 'var(--success)',
            longBreak: 'var(--xp-color)'
        };

        const progress = this.getProgress();
        const circleColor = modeColors[this.state.mode];

        container.innerHTML = `
            <div class="pomodoro-container">
                <div class="pomodoro-header">
                    <h3>⏱️ Pomodoro Таймер</h3>
                    <div class="pomodoro-sessions">
                        🍅 <span id="pomodoro-sessions-count">${this.state.totalSessionsToday}</span> сегодня
                    </div>
                </div>
                
                <div class="pomodoro-modes">
                    <button class="pomodoro-mode-btn ${this.state.mode === 'work' ? 'active' : ''}" 
                            data-mode="work">
                        🍅 Работа
                    </button>
                    <button class="pomodoro-mode-btn ${this.state.mode === 'shortBreak' ? 'active' : ''}" 
                            data-mode="shortBreak">
                        ☕ Перерыв
                    </button>
                    <button class="pomodoro-mode-btn ${this.state.mode === 'longBreak' ? 'active' : ''}" 
                            data-mode="longBreak">
                        🌟 Отдых
                    </button>
                </div>
                
                <div class="pomodoro-timer-display">
                    <svg class="pomodoro-progress-ring" width="200" height="200">
                        <circle class="pomodoro-ring-bg" 
                                stroke="var(--bg-primary)" 
                                stroke-width="8" 
                                fill="transparent" 
                                r="90" 
                                cx="100" 
                                cy="100"/>
                        <circle class="pomodoro-ring" 
                                stroke="${circleColor}" 
                                stroke-width="8" 
                                fill="transparent" 
                                r="90" 
                                cx="100" 
                                cy="100"
                                stroke-dasharray="${2 * Math.PI * 90}"
                                stroke-dashoffset="${2 * Math.PI * 90 * (1 - progress)}"
                                stroke-linecap="round"/>
                    </svg>
                    <div class="pomodoro-time">
                        <span id="pomodoro-time">${timeDisplay}</span>
                        <span class="pomodoro-mode-label">${modeLabels[this.state.mode]}</span>
                    </div>
                </div>
                
                <div class="pomodoro-controls">
                    ${this.state.isRunning && !this.state.isPaused ? `
                        <button class="pomodoro-btn pomodoro-pause" id="pomodoro-pause">
                            ⏸️ Пауза
                        </button>
                    ` : `
                        <button class="pomodoro-btn pomodoro-start" id="pomodoro-start">
                            ${this.state.isPaused ? '▶️ Продолжить' : '▶️ Старт'}
                        </button>
                    `}
                    <button class="pomodoro-btn pomodoro-reset" id="pomodoro-reset">
                        🔄 Сброс
                    </button>
                </div>
                
                <div class="pomodoro-task">
                    <span class="pomodoro-task-label">📋 Текущая задача:</span>
                    <select id="pomodoro-task-select">
                        <option value="">Выберите задачу...</option>
                        ${this.renderTaskOptions()}
                    </select>
                </div>
                
                <div class="pomodoro-stats">
                    <div class="pomodoro-stat">
                        <span class="pomodoro-stat-value">${this.state.sessionsCompleted}</span>
                        <span class="pomodoro-stat-label">Сессий сейчас</span>
                    </div>
                    <div class="pomodoro-stat">
                        <span class="pomodoro-stat-value">${this.state.totalSessionsToday}</span>
                        <span class="pomodoro-stat-label">Всего сегодня</span>
                    </div>
                    <div class="pomodoro-stat">
                        <span class="pomodoro-stat-value">${Math.round(this.state.totalSessionsToday * 25)} мин</span>
                        <span class="pomodoro-stat-label">Сфокусирован</span>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    /**
     * Рендер опций задач
     */
    renderTaskOptions() {
        const tasks = Storage.getActiveTasks();
        return tasks.map(task => `
            <option value="${task.id}" ${this.state.currentTaskId === task.id ? 'selected' : ''}>
                ${task.title}
            </option>
        `).join('');
    },

    /**
     * Получить прогресс круга
     */
    getProgress() {
        let totalTime;
        switch (this.state.mode) {
            case 'work': totalTime = this.config.workTime; break;
            case 'shortBreak': totalTime = this.config.shortBreak; break;
            case 'longBreak': totalTime = this.config.longBreak; break;
        }
        return this.state.timeLeft / totalTime;
    },

    /**
     * Запуск таймера
     */
    start() {
        if (this.state.isRunning && !this.state.isPaused) return;

        this.state.isRunning = true;
        this.state.isPaused = false;

        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft--;

            if (this.state.timeLeft <= 0) {
                this.completeSession();
            }

            this.updateDisplay();
        }, 1000);

        this.render();
    },

    /**
     * Пауза
     */
    pause() {
        if (!this.state.isRunning) return;

        this.state.isPaused = true;
        clearInterval(this.state.timerInterval);
        this.render();
    },

    /**
     * Сброс
     */
    reset() {
        this.stop();
        
        switch (this.state.mode) {
            case 'work': this.state.timeLeft = this.config.workTime; break;
            case 'shortBreak': this.state.timeLeft = this.config.shortBreak; break;
            case 'longBreak': this.state.timeLeft = this.config.longBreak; break;
        }
        
        this.render();
    },

    /**
     * Остановка
     */
    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        clearInterval(this.state.timerInterval);
    },

    /**
     * Завершение сессии
     */
    completeSession() {
        this.stop();

        // Звуковое уведомление
        this.playNotificationSound();

        if (this.state.mode === 'work') {
            this.state.sessionsCompleted++;
            this.state.totalSessionsToday++;
            this.saveState();

            // Награда XP
            const profile = Storage.getProfile();
            if (profile) {
                profile.totalXp += 10;
                profile.xp += 10;
                Storage.saveProfile(profile);
            }

            // Проверка на длинный перерыв
            if (this.state.sessionsCompleted >= this.config.sessionsBeforeLongBreak) {
                this.state.sessionsCompleted = 0;
                this.state.mode = 'longBreak';
                this.state.timeLeft = this.config.longBreak;
                App.showNotification('🌟 Отличная работа! Длинный перерыв заслужен!', 'success');
            } else {
                this.state.mode = 'shortBreak';
                this.state.timeLeft = this.config.shortBreak;
                App.showNotification('☕ Время для короткого перерыва!', 'success');
            }
        } else {
            // Перерыв закончен
            this.state.mode = 'work';
            this.state.timeLeft = this.config.workTime;
            App.showNotification('🍅 Перерыв окончен! За работу!', 'success');
        }

        this.render();
    },

    /**
     * Обновление отображения
     */
    updateDisplay() {
        const minutes = Math.floor(this.state.timeLeft / 60);
        const seconds = this.state.timeLeft % 60;
        const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        const timeEl = document.getElementById('pomodoro-time');
        const ringEl = document.querySelector('.pomodoro-ring');

        if (timeEl) timeEl.textContent = timeDisplay;
        
        if (ringEl) {
            const progress = this.getProgress();
            const circumference = 2 * Math.PI * 90;
            ringEl.style.strokeDashoffset = circumference * (1 - progress);
        }
    },

    /**
     * Переключение режима
     */
    switchMode(mode) {
        this.stop();
        this.state.mode = mode;
        this.state.isPaused = false;

        switch (mode) {
            case 'work': this.state.timeLeft = this.config.workTime; break;
            case 'shortBreak': this.state.timeLeft = this.config.shortBreak; break;
            case 'longBreak': this.state.timeLeft = this.config.longBreak; break;
        }

        this.render();
    },

    /**
     * Выбор задачи
     */
    selectTask(taskId) {
        this.state.currentTaskId = taskId;
    },

    /**
     * Звук уведомления
     */
    playNotificationSound() {
        // Вибрация для мобильных
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }

        // Уведомление браузера
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Таймер', {
                body: this.state.mode === 'work' ? 'Время перерыва!' : 'Время работать!',
                icon: '🍅'
            });
        }
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Кнопки управления
        document.getElementById('pomodoro-start')?.addEventListener('click', () => this.start());
        document.getElementById('pomodoro-pause')?.addEventListener('click', () => this.pause());
        document.getElementById('pomodoro-reset')?.addEventListener('click', () => this.reset());

        // Переключение режимов
        document.querySelectorAll('.pomodoro-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Выбор задачи
        document.getElementById('pomodoro-task-select')?.addEventListener('change', (e) => {
            this.selectTask(e.target.value);
        });
    }
};
