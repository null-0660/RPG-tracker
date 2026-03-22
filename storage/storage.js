/**
 * Storage Module v2.0
 * Модуль для работы с localStorage
 * Управление данными приложения LifeRPG
 */

const Storage = {
    KEYS: {
        PROFILE: 'liferpg_profile_v2',
        TASKS: 'liferpg_tasks_v2',
        SETTINGS: 'liferpg_settings_v2',
        ACHIEVEMENTS: 'liferpg_achievements_v2',
        INVENTORY: 'liferpg_inventory_v2',
        LAST_VISIT: 'liferpg_last_visit_v2',
        DAILY_QUEST: 'liferpg_daily_quest_v2'
    },

    /**
     * Инициализация хранилища
     */
    init() {
        if (!this.getProfile()) {
            this.saveProfile(this.createDefaultProfile());
        }
        if (!this.getTasks()) {
            this.saveTasks([]);
        }
        if (!this.getAchievements()) {
            this.saveAchievements(this.createDefaultAchievements());
        }
        if (!this.getInventory()) {
            this.saveInventory(this.createDefaultInventory());
        }
        this.checkStreak();
        this.checkDailyQuest();
    },

    /**
     * Создание профиля по умолчанию
     */
    createDefaultProfile() {
        return {
            name: 'Игрок',
            avatar: '🧙‍♂️',
            level: 1,
            xp: 0,
            totalXp: 0,
            streak: 0,
            bestStreak: 0,
            tasksCompleted: 0,
            gold: 0,
            totalGold: 0,
            battlesWon: 0,
            battlesLost: 0,
            stats: {
                intellect: 0,
                strength: 0,
                creative: 0,
                luck: 0
            },
            skins: ['🧙‍♂️'],
            equippedSkin: '🧙‍♂️',
            activeBoosters: [],
            createdAt: new Date().toISOString()
        };
    },

    /**
     * Создание инвентаря по умолчанию
     */
    createDefaultInventory() {
        return {
            'health-potion': 2,
            'mana-potion': 0,
            'strength-potion': 0,
            'xp-booster': 0,
            'gold-booster': 0
        };
    },

    /**
     * Создание достижений по умолчанию
     */
    createDefaultAchievements() {
        return [
            {
                id: 'first_task',
                title: 'Первый шаг',
                description: 'Выполните первую задачу',
                icon: '🎯',
                unlocked: false,
                progress: 0,
                required: 1
            },
            {
                id: 'task_master_10',
                title: 'Мастер задач',
                description: 'Выполните 10 задач',
                icon: '⭐',
                unlocked: false,
                progress: 0,
                required: 10
            },
            {
                id: 'task_master_50',
                title: 'Легенда задач',
                description: 'Выполните 50 задач',
                icon: '🏆',
                unlocked: false,
                progress: 0,
                required: 50
            },
            {
                id: 'task_master_100',
                title: 'Мифический герой',
                description: 'Выполните 100 задач',
                icon: '👑',
                unlocked: false,
                progress: 0,
                required: 100
            },
            {
                id: 'level_5',
                title: 'Опытный игрок',
                description: 'Достигните 5 уровня',
                icon: '🎮',
                unlocked: false,
                progress: 0,
                required: 5
            },
            {
                id: 'level_10',
                title: 'Ветеран',
                description: 'Достигните 10 уровня',
                icon: '⚔️',
                unlocked: false,
                progress: 0,
                required: 10
            },
            {
                id: 'level_20',
                title: 'Легенда',
                description: 'Достигните 20 уровня',
                icon: '🌟',
                unlocked: false,
                progress: 0,
                required: 20
            },
            {
                id: 'streak_3',
                title: 'Три дня подряд',
                description: 'Поддерживайте стрик 3 дня',
                icon: '🔥',
                unlocked: false,
                progress: 0,
                required: 3
            },
            {
                id: 'streak_7',
                title: 'Недельный марафон',
                description: 'Поддерживайте стрик 7 дней',
                icon: '💪',
                unlocked: false,
                progress: 0,
                required: 7
            },
            {
                id: 'streak_30',
                title: 'Месяц силы',
                description: 'Поддерживайте стрик 30 дней',
                icon: '⚡',
                unlocked: false,
                progress: 0,
                required: 30
            },
            {
                id: 'xp_1000',
                title: 'Тысяча очков',
                description: 'Заработайте 1000 XP',
                icon: '✨',
                unlocked: false,
                progress: 0,
                required: 1000
            },
            {
                id: 'xp_5000',
                title: 'Пять тысяч очков',
                description: 'Заработайте 5000 XP',
                icon: '💫',
                unlocked: false,
                progress: 0,
                required: 5000
            },
            {
                id: 'xp_10000',
                title: 'Десять тысяч очков',
                description: 'Заработайте 10000 XP',
                icon: '🌠',
                unlocked: false,
                progress: 0,
                required: 10000
            },
            {
                id: 'study_10',
                title: 'Учёный',
                description: 'Выполните 10 учебных задач',
                icon: '📚',
                unlocked: false,
                progress: 0,
                required: 10
            },
            {
                id: 'study_50',
                title: 'Профессор',
                description: 'Выполните 50 учебных задач',
                icon: '🎓',
                unlocked: false,
                progress: 0,
                required: 50
            },
            {
                id: 'sport_10',
                title: 'Атлет',
                description: 'Выполните 10 спортивных задач',
                icon: '🏃',
                unlocked: false,
                progress: 0,
                required: 10
            },
            {
                id: 'sport_50',
                title: 'Олимпиец',
                description: 'Выполните 50 спортивных задач',
                icon: '🏅',
                unlocked: false,
                progress: 0,
                required: 50
            },
            {
                id: 'creative_10',
                title: 'Творец',
                description: 'Выполните 10 творческих задач',
                icon: '🎨',
                unlocked: false,
                progress: 0,
                required: 10
            },
            {
                id: 'creative_50',
                title: 'Художник',
                description: 'Выполните 50 творческих задач',
                icon: '🖌️',
                unlocked: false,
                progress: 0,
                required: 50
            },
            {
                id: 'battle_1',
                title: 'Первая кровь',
                description: 'Победите в первом бою',
                icon: '⚔️',
                unlocked: false,
                progress: 0,
                required: 1
            },
            {
                id: 'battle_10',
                title: 'Воин',
                description: 'Победите в 10 боях',
                icon: '🗡️',
                unlocked: false,
                progress: 0,
                required: 10
            },
            {
                id: 'gold_100',
                title: 'Богач',
                description: 'Заработайте 100 золота',
                icon: '💰',
                unlocked: false,
                progress: 0,
                required: 100
            },
            {
                id: 'gold_1000',
                title: 'Магнат',
                description: 'Заработайте 1000 золота',
                icon: '💎',
                unlocked: false,
                progress: 0,
                required: 1000
            }
        ];
    },

    /**
     * Проверка и обновление стрика
     */
    checkStreak() {
        const lastVisit = localStorage.getItem(this.KEYS.LAST_VISIT);
        const profile = this.getProfile();
        const today = new Date().toDateString();

        if (lastVisit) {
            const lastDate = new Date(lastVisit);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                profile.streak = 0;
            } else if (diffDays === 1 && lastDate.toDateString() !== today) {
                profile.streak++;
                if (profile.streak > profile.bestStreak) {
                    profile.bestStreak = profile.streak;
                }
            }
        } else {
            profile.streak = 1;
            profile.bestStreak = 1;
        }

        localStorage.setItem(this.KEYS.LAST_VISIT, new Date().toISOString());
        this.saveProfile(profile);
    },

    /**
     * Проверка ежедневного квеста
     */
    checkDailyQuest() {
        const dailyQuest = localStorage.getItem(this.KEYS.DAILY_QUEST);
        const today = new Date().toDateString();

        if (!dailyQuest || JSON.parse(dailyQuest).date !== today) {
            localStorage.setItem(this.KEYS.DAILY_QUEST, JSON.stringify({
                date: today,
                progress: 0,
                target: 3,
                completed: false
            }));
        }
    },

    /**
     * Обновление ежедневного квеста
     */
    updateDailyQuest() {
        const dailyQuest = JSON.parse(localStorage.getItem(this.KEYS.DAILY_QUEST));
        if (dailyQuest && !dailyQuest.completed) {
            dailyQuest.progress++;
            if (dailyQuest.progress >= dailyQuest.target) {
                dailyQuest.completed = true;
            }
            localStorage.setItem(this.KEYS.DAILY_QUEST, JSON.stringify(dailyQuest));
            return dailyQuest;
        }
        return dailyQuest;
    },

    /**
     * Получить ежедневный квест
     */
    getDailyQuest() {
        return JSON.parse(localStorage.getItem(this.KEYS.DAILY_QUEST));
    },

    /**
     * Профиль
     */
    getProfile() {
        const data = localStorage.getItem(this.KEYS.PROFILE);
        return data ? JSON.parse(data) : null;
    },

    saveProfile(profile) {
        localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
    },

    updateProfile(updates) {
        const profile = this.getProfile();
        Object.assign(profile, updates);
        this.saveProfile(profile);
        return profile;
    },

    /**
     * Задачи
     */
    getTasks() {
        const data = localStorage.getItem(this.KEYS.TASKS);
        return data ? JSON.parse(data) : [];
    },

    saveTasks(tasks) {
        localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    },

    getTask(id) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === id);
    },

    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    },

    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },

    deleteTask(id) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== id);
        this.saveTasks(filtered);
    },

    getActiveTasks() {
        return this.getTasks().filter(t => t.status === 'active');
    },

    getCompletedTasks() {
        return this.getTasks().filter(t => t.status === 'done');
    },

    getTasksByType(type) {
        return this.getTasks().filter(t => t.type === type);
    },

    /**
     * Инвентарь
     */
    getInventory() {
        const data = localStorage.getItem(this.KEYS.INVENTORY);
        return data ? JSON.parse(data) : {};
    },

    saveInventory(inventory) {
        localStorage.setItem(this.KEYS.INVENTORY, JSON.stringify(inventory));
    },

    getItem(itemId) {
        const inventory = this.getInventory();
        return inventory[itemId] || 0;
    },

    addItem(itemId, quantity = 1) {
        const inventory = this.getInventory();
        inventory[itemId] = (inventory[itemId] || 0) + quantity;
        this.saveInventory(inventory);
        return inventory[itemId];
    },

    removeItem(itemId, quantity = 1) {
        const inventory = this.getInventory();
        if (inventory[itemId] >= quantity) {
            inventory[itemId] -= quantity;
            this.saveInventory(inventory);
            return true;
        }
        return false;
    },

    useItem(itemId) {
        return this.removeItem(itemId, 1);
    },

    /**
     * Достижения
     */
    getAchievements() {
        const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
        return data ? JSON.parse(data) : null;
    },

    saveAchievements(achievements) {
        localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    },

    updateAchievement(id, updates) {
        const achievements = this.getAchievements();
        const index = achievements.findIndex(a => a.id === id);
        if (index !== -1) {
            achievements[index] = { ...achievements[index], ...updates };
            this.saveAchievements(achievements);
            return achievements[index];
        }
        return null;
    },

    checkAchievements(profile) {
        const achievements = this.getAchievements();
        const unlocked = [];
        const tasksStats = this.getTasksStatsByType();

        achievements.forEach(achievement => {
            if (achievement.unlocked) return;

            let shouldUnlock = false;

            switch (achievement.id) {
                case 'first_task':
                    achievement.progress = profile.tasksCompleted;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'task_master_10':
                case 'task_master_50':
                case 'task_master_100':
                    achievement.progress = profile.tasksCompleted;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'level_5':
                case 'level_10':
                case 'level_20':
                    achievement.progress = profile.level;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'streak_3':
                case 'streak_7':
                case 'streak_30':
                    achievement.progress = profile.streak;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'xp_1000':
                case 'xp_5000':
                case 'xp_10000':
                    achievement.progress = profile.totalXp;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'study_10':
                case 'study_50':
                    achievement.progress = tasksStats.study;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'sport_10':
                case 'sport_50':
                    achievement.progress = tasksStats.sport;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'creative_10':
                case 'creative_50':
                    achievement.progress = tasksStats.creative;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'battle_1':
                case 'battle_10':
                    achievement.progress = profile.battlesWon;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
                case 'gold_100':
                case 'gold_1000':
                    achievement.progress = profile.totalGold;
                    shouldUnlock = achievement.progress >= achievement.required;
                    break;
            }

            if (shouldUnlock) {
                achievement.unlocked = true;
                unlocked.push(achievement);
            }
        });

        this.saveAchievements(achievements);
        return unlocked;
    },

    /**
     * Статистика по типу задач
     */
    getTasksStatsByType() {
        const tasks = this.getCompletedTasks();
        const stats = {
            study: 0,
            sport: 0,
            creative: 0,
            other: 0
        };

        tasks.forEach(task => {
            if (stats[task.type] !== undefined) {
                stats[task.type]++;
            }
        });

        return stats;
    },

    /**
     * XP за сегодня
     */
    getXpToday() {
        const today = new Date().toDateString();
        const tasks = this.getCompletedTasks();
        let xpToday = 0;

        tasks.forEach(task => {
            if (task.completedAt) {
                const taskDate = new Date(task.completedAt).toDateString();
                if (taskDate === today) {
                    xpToday += task.xp;
                }
            }
        });

        return xpToday;
    },

    /**
     * Задач выполнено сегодня
     */
    getTasksDoneToday() {
        const today = new Date().toDateString();
        const tasks = this.getCompletedTasks();
        return tasks.filter(task => {
            if (task.completedAt) {
                return new Date(task.completedAt).toDateString() === today;
            }
            return false;
        }).length;
    },

    /**
     * Экспорт данных
     */
    exportData() {
        const data = {
            profile: this.getProfile(),
            tasks: this.getTasks(),
            achievements: this.getAchievements(),
            inventory: this.getInventory(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    /**
     * Импорт данных
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.profile) this.saveProfile(data.profile);
            if (data.tasks) this.saveTasks(data.tasks);
            if (data.achievements) this.saveAchievements(data.achievements);
            if (data.inventory) this.saveInventory(data.inventory);
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    /**
     * Сброс прогресса
     */
    resetProgress() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    },

    /**
     * Расчет уровня по XP
     */
    calculateLevel(xp) {
        return Math.floor(xp / 100) + 1;
    },

    /**
     * XP до следующего уровня
     */
    xpToNextLevel(xp) {
        const currentLevel = this.calculateLevel(xp);
        const nextLevelXp = currentLevel * 100;
        return nextLevelXp - (xp % 100);
    },

    /**
     * Прогресс до следующего уровня (0-100)
     */
    levelProgress(xp) {
        return (xp % 100);
    },

    /**
     * Получить заголовок по уровню
     */
    getTitleByLevel(level) {
        const titles = [
            { level: 1, title: 'Новичок', icon: '🌱' },
            { level: 5, title: 'Ученик', icon: '📖' },
            { level: 10, title: 'Адепт', icon: '⚡' },
            { level: 15, title: 'Маг', icon: '🔮' },
            { level: 20, title: 'Архимаг', icon: '🌟' },
            { level: 25, title: 'Легенда', icon: '👑' },
            { level: 30, title: 'Божество', icon: '✨' }
        ];

        for (let i = titles.length - 1; i >= 0; i--) {
            if (level >= titles[i].level) {
                return titles[i];
            }
        }
        return titles[0];
    },

    /**
     * Проверка активного бустера
     */
    checkActiveBoosters() {
        const profile = this.getProfile();
        const now = Date.now();

        profile.activeBoosters = profile.activeBoosters.filter(booster => {
            return booster.expiresAt > now;
        });

        this.saveProfile(profile);
        return profile.activeBoosters;
    },

    /**
     * Активировать бустер
     */
    activateBooster(type, durationMinutes) {
        const profile = this.getProfile();
        const expiresAt = Date.now() + (durationMinutes * 60 * 1000);

        profile.activeBoosters.push({
            type,
            expiresAt
        });

        this.saveProfile(profile);
        return expiresAt;
    },

    /**
     * Получить множитель XP
     */
    getXpMultiplier() {
        const boosters = this.checkActiveBoosters();
        let multiplier = 1;

        boosters.forEach(booster => {
            if (booster.type === 'xp-booster') {
                multiplier += 0.5;
            }
            if (booster.type === 'mana-potion') {
                multiplier += 0.2;
            }
        });

        return multiplier;
    },

    /**
     * Получить множитель урона
     */
    getDamageMultiplier() {
        const boosters = this.checkActiveBoosters();
        let multiplier = 1;

        boosters.forEach(booster => {
            if (booster.type === 'strength-potion') {
                multiplier += 0.5;
            }
        });

        return multiplier;
    }
};

// Инициализация при загрузке
Storage.init();
