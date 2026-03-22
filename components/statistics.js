/**
 * Statistics Component v2.0
 * Расширенная статистика и аналитика для LifeRPG
 * Помогает отслеживать прогресс и эффективность
 */

const Statistics = {
    /**
     * Инициализация
     */
    init() {
        this.loadStatistics();
    },

    /**
     * Загрузка статистики
     */
    loadStatistics() {
        const stats = localStorage.getItem('liferpg_stats_v2');
        if (!stats) {
            this.defaultStats = {
                // Общая статистика
                totalXpEarned: 0,
                totalGoldEarned: 0,
                totalTasksCreated: 0,
                totalTasksCompleted: 0,
                
                // По типам задач
                tasksByType: {
                    study: { created: 0, completed: 0 },
                    sport: { created: 0, completed: 0 },
                    creative: { created: 0, completed: 0 },
                    other: { created: 0, completed: 0 }
                },
                
                // Боевая статистика
                battlesTotal: 0,
                battlesWon: 0,
                battlesLost: 0,
                totalDamageDealt: 0,
                totalDamageReceived: 0,
                criticalHits: 0,
                
                // Привычки
                habitsCompleted: 0,
                habitStreakBest: 0,
                
                // Время
                totalTimeSpent: 0, // в минутах
                mostProductiveDay: '',
                mostProductiveHour: 0,
                
                // Достижения
                achievementsUnlocked: 0,
                
                // Серия дней
                bestStreak: 0,
                currentStreak: 0,
                
                // История по дням (последние 7 дней)
                dailyStats: []
            };
            this.stats = this.defaultStats;
            this.saveStatistics(this.stats);
        } else {
            this.stats = JSON.parse(stats);
        }
    },

    /**
     * Сохранение статистики
     */
    saveStatistics(stats) {
        localStorage.setItem('liferpg_stats_v2', JSON.stringify(stats));
        this.stats = stats;
    },

    /**
     * Обновление статистики при выполнении задачи
     */
    onTaskComplete(task, xpEarned) {
        const profile = Storage.getProfile();
        const today = new Date().toDateString();
        const hour = new Date().getHours();

        // Обновляем общую статистику
        this.stats.totalTasksCompleted++;
        this.stats.totalXpEarned += xpEarned;
        this.stats.totalTimeSpent += task.duration || 0;

        // По типу задачи
        if (this.stats.tasksByType[task.type]) {
            this.stats.tasksByType[task.type].completed++;
        }

        // Обновляем ежедневную статистику
        this.updateDailyStats(today, {
            tasksCompleted: 1,
            xpEarned: xpEarned,
            timeSpent: task.duration || 0
        });

        // Обновляем самое продуктивное время
        this.updateProductiveTime(hour);

        // Обновляем серию
        if (profile.streak > this.stats.bestStreak) {
            this.stats.bestStreak = profile.streak;
        }
        this.stats.currentStreak = profile.streak;

        this.saveStatistics(this.stats);
    },

    /**
     * Обновление статистики при создании задачи
     */
    onTaskCreate(task) {
        this.stats.totalTasksCreated++;
        
        if (this.stats.tasksByType[task.type]) {
            this.stats.tasksByType[task.type].created++;
        }

        this.saveStatistics(this.stats);
    },

    /**
     * Обновление боевой статистики
     */
    onBattleResult(won, damageDealt, damageReceived, isCrit, goldEarned, xpEarned) {
        this.stats.battlesTotal++;
        
        if (won) {
            this.stats.battlesWon++;
            this.stats.totalGoldEarned += goldEarned;
            this.stats.totalXpEarned += xpEarned;
        } else {
            this.stats.battlesLost++;
        }

        this.stats.totalDamageDealt += damageDealt;
        this.stats.totalDamageReceived += damageReceived;
        
        if (isCrit) {
            this.stats.criticalHits++;
        }

        this.saveStatistics(this.stats);
    },

    /**
     * Обновление статистики привычек
     */
    onHabitComplete(habit) {
        this.stats.habitsCompleted++;
        
        if (habit.streak > this.stats.habitStreakBest) {
            this.stats.habitStreakBest = habit.streak;
        }

        this.saveStatistics(this.stats);
    },

    /**
     * Обновление ежедневной статистики
     */
    updateDailyStats(date, data) {
        // Находим запись за сегодня
        let todayStats = this.stats.dailyStats.find(s => s.date === date);
        
        if (!todayStats) {
            // Создаем новую запись
            todayStats = {
                date: date,
                tasksCompleted: 0,
                xpEarned: 0,
                timeSpent: 0,
                habitsCompleted: 0,
                battlesWon: 0
            };
            
            // Добавляем и сохраняем только последние 7 дней
            this.stats.dailyStats.push(todayStats);
            if (this.stats.dailyStats.length > 7) {
                this.stats.dailyStats.shift();
            }
        }

        // Обновляем данные
        todayStats.tasksCompleted += data.tasksCompleted || 0;
        todayStats.xpEarned += data.xpEarned || 0;
        todayStats.timeSpent += data.timeSpent || 0;
    },

    /**
     * Обновление продуктивного времени
     */
    updateProductiveTime(hour) {
        // Простая реализация: запоминаем час с наибольшей активностью
        if (!this.stats.productiveHours) {
            this.stats.productiveHours = {};
        }
        
        this.stats.productiveHours[hour] = (this.stats.productiveHours[hour] || 0) + 1;
        
        // Находим самый продуктивный час
        let maxCount = 0;
        for (const [h, count] of Object.entries(this.stats.productiveHours)) {
            if (count > maxCount) {
                maxCount = count;
                this.stats.mostProductiveHour = parseInt(h);
            }
        }

        this.saveStatistics(this.stats);
    },

    /**
     * Получить полную статистику
     */
    getFullStats() {
        return this.stats;
    },

    /**
     * Получить статистику по типам задач
     */
    getTasksTypeStats() {
        return this.stats.tasksByType;
    },

    /**
     * Получить боевую статистику
     */
    getBattleStats() {
        if (!this.stats) return { total: 0, won: 0, lost: 0, winRate: 0, totalDamage: 0, totalReceived: 0, criticalHits: 0 };
        
        return {
            total: this.stats.battlesTotal || 0,
            won: this.stats.battlesWon || 0,
            lost: this.stats.battlesLost || 0,
            winRate: this.stats.battlesTotal > 0
                ? Math.round((this.stats.battlesWon / this.stats.battlesTotal) * 100)
                : 0,
            totalDamage: this.stats.totalDamageDealt || 0,
            totalReceived: this.stats.totalDamageReceived || 0,
            criticalHits: this.stats.criticalHits || 0
        };
    },

    /**
     * Получить ежедневную статистику для графика
     */
    getDailyStatsForChart() {
        if (!this.stats || !this.stats.dailyStats) return [];
        
        return this.stats.dailyStats.map(day => ({
            date: new Date(day.date).toLocaleDateString('ru-RU', {
                weekday: 'short',
                day: 'numeric'
            }),
            tasks: day.tasksCompleted || 0,
            xp: day.xpEarned || 0
        }));
    },

    /**
     * Получить эффективность по типам задач
     */
    getTaskEfficiency() {
        if (!this.stats || !this.stats.tasksByType) return {};
        
        const efficiency = {};

        for (const [type, data] of Object.entries(this.stats.tasksByType)) {
            efficiency[type] = {
                created: data.created || 0,
                completed: data.completed || 0,
                completionRate: data.created > 0
                    ? Math.round((data.completed / data.created) * 100)
                    : 0
            };
        }

        return efficiency;
    },

    /**
     * Рендер статистики в профиле
     */
    render() {
        const container = document.getElementById('statistics-list');
        if (!container) return;
        
        // Проверка инициализации
        if (!this.stats) {
            this.loadStatistics();
        }

        const battleStats = this.getBattleStats();
        const efficiency = this.getTaskEfficiency();

        container.innerHTML = `
            <div class="stats-section">
                <h2>📊 Боевая статистика</h2>
                <div class="stats-grid-mini">
                    <div class="stat-mini">
                        <span class="stat-mini-value">${battleStats.total}</span>
                        <span class="stat-mini-label">Всего боев</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-value" style="color: var(--success)">${battleStats.won}</span>
                        <span class="stat-mini-label">Побед</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-value" style="color: var(--error)">${battleStats.lost}</span>
                        <span class="stat-mini-label">Поражений</span>
                    </div>
                    <div class="stat-mini">
                        <span class="stat-mini-value">${battleStats.winRate}%</span>
                        <span class="stat-mini-label">Win Rate</span>
                    </div>
                </div>
            </div>

            <div class="stats-section">
                <h2>📈 Эффективность по типам</h2>
                <div class="efficiency-list">
                    ${Object.entries(efficiency).map(([type, data]) => `
                        <div class="efficiency-item">
                            <span class="efficiency-type">${this.getTypeIcon(type)} ${this.getTypeName(type)}</span>
                            <div class="efficiency-bar">
                                <div class="efficiency-fill" style="width: ${data.completionRate}%"></div>
                            </div>
                            <span class="efficiency-rate">${data.completionRate}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="stats-section">
                <h2>📅 Активность (7 дней)</h2>
                <div class="weekly-activity">
                    ${this.getDailyStatsForChart().map(day => `
                        <div class="day-activity">
                            <span class="day-name">${day.date}</span>
                            <span class="day-tasks">${day.tasks} зад.</span>
                            <span class="day-xp">${day.xp} XP</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Получить иконку типа задачи
     */
    getTypeIcon(type) {
        const icons = {
            study: '📚',
            sport: '💪',
            creative: '🎨',
            other: '📝'
        };
        return icons[type] || '📝';
    },

    /**
     * Получить название типа задачи
     */
    getTypeName(type) {
        const names = {
            study: 'Учёба',
            sport: 'Спорт',
            creative: 'Творчество',
            other: 'Другое'
        };
        return names[type] || 'Другое';
    }
};
