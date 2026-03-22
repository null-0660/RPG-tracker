/**
 * LifeRPG v2.0 - Главное приложение
 * Геймифицированная система управления задачами
 * с элементами карточного боя и RPG
 */

const App = {
    /**
     * Инициализация приложения
     */
    init() {
        console.log('🎮 LifeRPG v2.2 запущен!');

        // Проверка на сброс кеша
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('cleared')) {
            // Очищаем URL от параметра
            window.history.replaceState({}, document.title, window.location.pathname);
            // Показываем уведомление после загрузки
            setTimeout(() => {
                this.showNotification('🧹 Кеш и данные успешно очищены!', 'success');
            }, 500);
        }

        // Инициализация компонентов
        Modal.init();
        Dashboard.init();
        Deck.init();
        Profile.init();
        Battle.init();
        Shop.init();
        Achievements.init();
        Habits.init();
        Motivation.init();
        Statistics.init();
        Leaderboard.init();
        Pomodoro.init();

        // Привязка навигации
        this.bindNavigation();

        // Проверка достижений при загрузке
        this.checkAchievementsOnLoad();

        // Проверка бустеров
        Storage.checkActiveBoosters();

        // Добавляем тестовые задачи если их нет
        this.addDemoTasksIfEmpty();

        // Обновляем меню
        this.updateMenuUserInfo();

        // Регистрация PWA
        this.registerPWA();

        // Запрос разрешения на уведомления
        this.requestNotificationPermission();
    },

    /**
     * Запрос разрешения на уведомления
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    /**
     * Привязка навигации
     */
    bindNavigation() {
        // Мобильное меню
        const menuBtn = document.getElementById('menu-btn');
        const menuClose = document.getElementById('menu-close');
        const mobileMenu = document.getElementById('mobile-menu');

        // Создаем оверлей
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menu-overlay';
        document.body.appendChild(overlay);

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                overlay.classList.add('active');
                menuBtn.classList.add('active'); // Анимация бургера
                // Блокируем прокрутку страницы, но не меню
                document.body.style.overflow = 'hidden';
            });
        }

        if (menuClose) {
            menuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Закрытие меню по клику на оверлей
        overlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Закрытие меню по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // Переключение вкладок - мобильное меню
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchView(view);
                this.closeMobileMenu();
            });
        });

        // Переключение вкладок - десктопное меню
        document.querySelectorAll('.desktop-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
    },

    /**
     * Закрытие мобильного меню
     */
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('menu-overlay');
        const menuBtn = document.getElementById('menu-btn');
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (menuBtn) menuBtn.classList.remove('active'); // Убираем анимацию бургера
        // Возвращаем прокрутку страницы
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
    },

    /**
     * Обновление информации о пользователе в меню
     */
    updateMenuUserInfo() {
        const profile = Storage.getProfile();
        if (!profile) return;

        const menuAvatar = document.getElementById('menu-avatar');
        const menuUserName = document.getElementById('menu-user-name');
        const menuLevel = document.getElementById('menu-level');

        if (menuAvatar) menuAvatar.textContent = profile.equippedSkin || profile.avatar;
        if (menuUserName) menuUserName.textContent = profile.name;
        if (menuLevel) menuLevel.textContent = profile.level;
    },

    /**
     * Переключение вида
     */
    switchView(viewName) {
        // Скрываем все виды
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Показываем нужный
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Обновляем активный пункт в мобильном меню
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Обновляем активный пункт в десктопном меню
        document.querySelectorAll('.desktop-menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Обновляем вид при переключении
        switch (viewName) {
            case 'dashboard':
                Dashboard.render();
                break;
            case 'deck':
                Deck.render();
                break;
            case 'battle':
                Battle.reset();
                break;
            case 'profile':
                Profile.render();
                break;
            case 'achievements':
                Achievements.render();
                break;
            case 'leaderboard':
                Leaderboard.refresh();
                break;
            case 'habits':
                Habits.render();
                this.updateHabitsStats();
                break;
            case 'pomodoro':
                Pomodoro.render();
                break;
            case 'shop':
                Shop.render();
                break;
            case 'more':
                // Кнопка "Ещё" не имеет своего view
                break;
        }

        // Прокрутка вверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * Обновление статистики привычек
     */
    updateHabitsStats() {
        if (typeof Habits !== 'undefined') {
            const stats = Habits.getStats();
            const totalEl = document.getElementById('habits-total');
            const todayEl = document.getElementById('habits-today');
            const streakEl = document.getElementById('habits-streak');
            const rateEl = document.getElementById('habits-rate');

            if (totalEl) totalEl.textContent = stats.total;
            if (todayEl) todayEl.textContent = stats.completedToday;
            if (streakEl) streakEl.textContent = stats.totalStreak;
            if (rateEl) rateEl.textContent = stats.completionRate + '%';
        }
    },

    /**
     * Выполнение задачи
     */
    completeTask(taskId, silent = false) {
        const task = Storage.getTask(taskId);
        if (!task || task.status === 'done') return;

        if (silent) {
            // Тихий режим для боя
            this.currentCompletingTask = taskId;
            return;
        }

        // Открываем модалку выполнения
        this.currentCompletingTask = taskId;
        Modal.openCompleteModal(task);
    },

    /**
     * Завершение выполнения задачи (после подтверждения)
     */
    finalizeTaskCompletion(taskId) {
        const task = Storage.getTask(taskId);
        if (!task) return;

        // Обновляем задачу
        task.status = 'done';
        task.completedAt = new Date().toISOString();
        Storage.updateTask(taskId, task);

        // Обновляем профиль
        const profile = Storage.getProfile();
        profile.tasksCompleted++;

        // Добавляем XP
        const xpResult = Profile.addXp(task.xp, this.getStatType(task.type));

        // Обновляем ежедневный квест
        const dailyQuest = Storage.updateDailyQuest();

        // Сохраняем профиль
        Storage.saveProfile(profile);

        // Проверяем достижения
        Achievements.checkAndUpdate(profile, task);

        // Обновляем статистику
        if (typeof Statistics !== 'undefined') {
            Statistics.onTaskComplete(task, xpResult.xpGained);
        }

        // Обновляем UI
        Deck.updateCard(taskId, task);
        Dashboard.updateAfterTaskComplete();

        // Мотивационное сообщение
        let message = `+${xpResult.xpGained} XP | `;
        if (xpResult.leveledUp) {
            message += `🎉 Уровень ${xpResult.newLevel}! | `;
        }
        if (dailyQuest?.completed) {
            message += '📜 Ежедневный квест выполнен! | ';
            profile.gold += 50;
            Storage.saveProfile(profile);
        }
        
        // Добавляем мотивационное сообщение
        if (typeof Motivation !== 'undefined') {
            message += Motivation.getTaskCompletionMessage(task.type);
        } else {
            message += 'Задача выполнена!';
        }

        this.showNotification(message, 'success');

        this.currentCompletingTask = null;
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
     * Редактирование задачи
     */
    editTask(taskId) {
        Modal.openTaskModal(taskId);
    },

    /**
     * Удаление задачи
     */
    deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            Storage.deleteTask(taskId);
            Deck.removeCard(taskId);
            Dashboard.renderActiveTasks();
            this.showNotification('Задача удалена', 'info');
        }
    },

    /**
     * Показ уведомления
     */
    showNotification(message, type = 'info') {
        // Проверка настроек уведомлений
        const notificationsEnabled = localStorage.getItem('liferpg_notifications') !== 'false';
        if (!notificationsEnabled && type !== 'error') return;

        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        notification.innerHTML = `
            <span>${icons[type] || icons.info}</span>
            <span>${this.escapeHtml(message)}</span>
        `;

        // Стили для анимации
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        notification.style.transition = 'all 0.3s ease';

        container.appendChild(notification);

        // Анимация появления
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        });

        // Вибрация для мобильных
        if (navigator.vibrate && type === 'success') {
            navigator.vibrate(50);
        }

        // Удаление через 3 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },

    /**
     * Проверка достижений при загрузке
     */
    checkAchievementsOnLoad() {
        const profile = Storage.getProfile();
        if (profile) {
            const unlocked = Storage.checkAchievements(profile);
            if (unlocked.length > 0) {
                this.showNotification(
                    `🏆 Разблокировано достижений: ${unlocked.length}`,
                    'success'
                );
            }
        }
    },

    /**
     * Добавить тестовые задачи если пусто
     */
    addDemoTasksIfEmpty() {
        const tasks = Storage.getTasks();
        if (tasks.length > 0) return;

        const demoTasks = [
            {
                id: 'demo_1',
                title: 'Прочитать 10 страниц',
                description: 'Начни с малого - прочитай 10 страниц книги',
                purpose: 'Развитие привычки чтения',
                benefit: 'Новые знания и словарный запас',
                type: 'study',
                difficulty: 2,
                duration: 20,
                xp: 25,
                level: 1,
                status: 'active',
                subtasks: [],
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: 'demo_2',
                title: 'Сделать 20 отжиманий',
                description: 'Тренировка верхней части тела',
                purpose: 'Поддержание физической формы',
                benefit: 'Сильные руки и грудь',
                type: 'sport',
                difficulty: 2,
                duration: 5,
                xp: 20,
                level: 1,
                status: 'active',
                subtasks: [
                    { id: 's1', title: 'Разминка', completed: false },
                    { id: 's2', title: '20 отжиманий', completed: false },
                    { id: 's3', title: 'Растяжка', completed: false }
                ],
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: 'demo_3',
                title: 'Нарисовать скетч',
                description: '15-минутный скетч любого объекта',
                purpose: 'Развитие творческих навыков',
                benefit: 'Улучшение воображения и моторики',
                type: 'creative',
                difficulty: 1,
                duration: 15,
                xp: 15,
                level: 1,
                status: 'active',
                subtasks: [],
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: 'demo_4',
                title: 'Выпить стакан воды',
                description: 'Поддержание водного баланса',
                purpose: 'Здоровье',
                benefit: 'Лучшее самочувствие',
                type: 'other',
                difficulty: 1,
                duration: 2,
                xp: 10,
                level: 1,
                status: 'active',
                subtasks: [],
                createdAt: new Date().toISOString(),
                completedAt: null
            }
        ];

        demoTasks.forEach(task => Storage.addTask(task));

        setTimeout(() => {
            this.showNotification('🎯 Добавлены демонстрационные задачи!', 'info');
        }, 1000);
    },

    /**
     * Регистрация PWA
     */
    registerPWA() {
        // PWA уже регистрируется в index.html
        // Здесь можно добавить дополнительную логику
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Получить текущий вид
     */
    getCurrentView() {
        const activeView = document.querySelector('.view.active');
        if (activeView) {
            return activeView.id.replace('-view', '');
        }
        return 'dashboard';
    }
};

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Обработка онлайн/оффлайн статуса
window.addEventListener('online', () => {
    App.showNotification('🌐 Соединение восстановлено', 'info');
});

window.addEventListener('offline', () => {
    App.showNotification('⚠️ Работа в оффлайн режиме', 'warning');
});

// Предотвращение случайного закрытия с несохраненными данными
window.addEventListener('beforeunload', (e) => {
    // Данные сохраняются автоматически в localStorage
    // Но можно добавить предупреждение если идет бой
    if (Battle.state.active) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// ============================================
// Улучшения для мобильных устройств
// ============================================

// Обработка свайпов для закрытия мобильного меню
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');
    
    // Свайп вправо для закрытия меню (если оно открыто)
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        if (touchStartX - touchEndX < -50) { // Свайп вправо
            App.closeMobileMenu();
        }
    }
}

// Предотвращение зума на iOS при двойном тапе
document.addEventListener('dblclick', (e) => {
    // Предотвращаем зум на некоторых устройствах
    if (e.target.closest('button') || e.target.closest('.menu-item')) {
        e.preventDefault();
    }
}, { passive: false });

// Улучшение отзывчивости кнопок на мобильных
document.addEventListener('touchstart', (e) => {
    if (e.target.closest('button') || e.target.closest('.menu-item') || e.target.closest('.btn-action')) {
        // Добавляем визуальный отклик
        e.target.style.opacity = '0.7';
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (e.target.closest('button') || e.target.closest('.menu-item') || e.target.closest('.btn-action')) {
        // Возвращаем прозрачность
        setTimeout(() => {
            e.target.style.opacity = '';
        }, 100);
    }
}, { passive: true });

// Блокировка зума на iOS Safari
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

// Оптимизация для PWA - обработка ориентации экрана
window.addEventListener('orientationchange', () => {
    // Небольшая задержка для корректного определения новой ориентации
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
});

// Обработка изменения размера окна для адаптации
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Перерисовка текущего вида при значительном изменении размера
        const currentView = App.getCurrentView();
        switch (currentView) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.render();
                break;
            case 'deck':
                if (typeof Deck !== 'undefined') Deck.render();
                break;
            case 'profile':
                if (typeof Profile !== 'undefined') Profile.render();
                break;
            case 'habits':
                if (typeof Habits !== 'undefined') Habits.render();
                break;
        }
    }, 250);
});
