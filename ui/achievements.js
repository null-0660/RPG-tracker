/**
 * Achievements Component v2.0
 * Компонент достижений
 */

const Achievements = {
    /**
     * Инициализация
     */
    init() {
        this.render();
    },

    /**
     * Рендер достижений
     */
    render() {
        const container = document.getElementById('achievements-list');
        const unlockedEl = document.getElementById('achievements-unlocked');
        const totalEl = document.getElementById('achievements-total');

        if (!container) return;

        const achievements = Storage.getAchievements();
        if (!achievements || achievements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <p class="empty-state-text">Достижения загружаются...</p>
                </div>
            `;
            return;
        }

        // Обновляем статистику
        if (unlockedEl && totalEl) {
            const unlocked = achievements.filter(a => a.unlocked).length;
            unlockedEl.textContent = unlocked;
            totalEl.textContent = achievements.length;
        }

        // Сортировка: сначала разблокированные, затем по прогрессу
        achievements.sort((a, b) => {
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;
            return b.progress - a.progress;
        });

        container.innerHTML = '';
        achievements.forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            container.appendChild(card);
        });
    },

    /**
     * Создать карточку достижения
     */
    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;

        const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.required) * 100));

        card.innerHTML = `
            <div class="achievement-icon">
                ${achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${!achievement.unlocked ? `
                    <div class="achievement-progress">
                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 4px;">
                            <span>Прогресс</span>
                            <span>${achievement.progress}/${achievement.required}</span>
                        </div>
                        <div style="height: 4px; background: var(--bg-primary); border-radius: 2px; overflow: hidden;">
                            <div style="width: ${progressPercent}%; height: 100%; background: var(--xp-color); border-radius: 2px;"></div>
                        </div>
                    </div>
                ` : `
                    <div class="achievement-progress" style="color: var(--xp-color);">
                        ✅ Разблокировано
                    </div>
                `}
            </div>
        `;

        return card;
    },

    /**
     * Проверка и обновление достижений
     */
    checkAndUpdate(profile, task = null) {
        const unlocked = Storage.checkAchievements(profile, task);

        // Показываем уведомления о новых достижениях
        unlocked.forEach(achievement => {
            App.showNotification(
                `🏆 Достижение разблокировано: ${achievement.title}!`,
                'success'
            );
        });

        // Перерисовываем, если мы на вкладке достижений
        const achievementsView = document.getElementById('achievements-view');
        if (achievementsView && achievementsView.classList.contains('active')) {
            this.render();
        }

        return unlocked;
    }
};
