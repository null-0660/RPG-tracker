/**
 * Profile Component v2.0
 * Компонент профиля пользователя
 */

const Profile = {
    /**
     * Инициализация профиля
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Рендер профиля
     */
    render() {
        const profile = Storage.getProfile();
        if (!profile) return;

        // Обновляем данные в UI
        this.updateUI(profile);
        this.renderInventory();
        
        // Рендер статистики
        if (typeof Statistics !== 'undefined') {
            Statistics.render();
        }
    },

    /**
     * Обновление UI профиля
     */
    updateUI(profile) {
        // Имя и аватар
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');
        const profileLevel = document.getElementById('profile-level');
        const userTitle = document.getElementById('user-title');
        const menuAvatar = document.getElementById('menu-avatar');
        const menuUserName = document.getElementById('menu-user-name');
        const menuLevel = document.getElementById('menu-level');

        if (userName) userName.textContent = profile.name;
        if (userAvatar) userAvatar.textContent = profile.equippedSkin || profile.avatar;
        if (profileLevel) profileLevel.textContent = profile.level;
        if (userTitle) {
            const titleData = Storage.getTitleByLevel(profile.level);
            userTitle.textContent = `${titleData.icon} ${titleData.title}`;
        }
        if (menuAvatar) menuAvatar.textContent = profile.equippedSkin || profile.avatar;
        if (menuUserName) menuUserName.textContent = profile.name;
        if (menuLevel) menuLevel.textContent = profile.level;

        // Статистика
        const totalXp = document.getElementById('total-xp');
        const totalTasks = document.getElementById('total-tasks');
        const bestStreak = document.getElementById('best-streak');
        const totalGold = document.getElementById('total-gold');

        if (totalXp) totalXp.textContent = profile.totalXp;
        if (totalTasks) totalTasks.textContent = profile.tasksCompleted;
        if (bestStreak) bestStreak.textContent = profile.bestStreak;
        if (totalGold) totalGold.textContent = profile.gold;

        // Характеристики
        this.updateStats(profile.stats);

        // Навигация (уровень и XP)
        this.updateNavLevel(profile);
    },

    /**
     * Обновление характеристик
     */
    updateStats(stats) {
        const total = stats.intellect + stats.strength + stats.creative + stats.luck || 1;

        // Интеллект
        const intellectEl = document.getElementById('stat-intellect');
        const intellectFill = document.getElementById('stat-intellect-fill');
        if (intellectEl) intellectEl.textContent = stats.intellect;
        if (intellectFill) intellectFill.style.width = `${(stats.intellect / total) * 100}%`;

        // Сила
        const strengthEl = document.getElementById('stat-strength');
        const strengthFill = document.getElementById('stat-strength-fill');
        if (strengthEl) strengthEl.textContent = stats.strength;
        if (strengthFill) strengthFill.style.width = `${(stats.strength / total) * 100}%`;

        // Креатив
        const creativeEl = document.getElementById('stat-creative');
        const creativeFill = document.getElementById('stat-creative-fill');
        if (creativeEl) creativeEl.textContent = stats.creative;
        if (creativeFill) creativeFill.style.width = `${(stats.creative / total) * 100}%`;

        // Удача
        const luckEl = document.getElementById('stat-luck');
        const luckFill = document.getElementById('stat-luck-fill');
        if (luckEl) luckEl.textContent = stats.luck;
        if (luckFill) luckFill.style.width = `${(stats.luck / total) * 100}%`;
    },

    /**
     * Обновление уровня в навигации
     */
    updateNavLevel(profile) {
        const navLevel = document.getElementById('nav-level');
        const navXpFill = document.getElementById('nav-xp-fill');
        const levelCurrent = document.getElementById('level-current');
        const xpProgress = document.getElementById('xp-progress');
        const xpProgressText = document.getElementById('xp-progress-text');
        const xpToNext = document.getElementById('xp-to-next');

        const xpPercent = Storage.levelProgress(profile.xp);
        const xpNext = Storage.xpToNextLevel(profile.xp);

        if (navLevel) navLevel.textContent = profile.level;
        if (navXpFill) navXpFill.style.width = `${xpPercent}%`;
        if (levelCurrent) levelCurrent.textContent = profile.level;
        if (xpProgress) xpProgress.style.width = `${xpPercent}%`;
        if (xpProgressText) xpProgressText.textContent = `${profile.xp % 100}/100 XP`;
        if (xpToNext) xpToNext.textContent = xpNext;
    },

    /**
     * Рендер инвентаря
     */
    renderInventory() {
        const container = document.getElementById('inventory-list');
        if (!container) return;

        const inventory = Storage.getInventory();
        const items = {
            'health-potion': { name: 'Зелье лечения', icon: '💚' },
            'mana-potion': { name: 'Зелье маны', icon: '💙' },
            'strength-potion': { name: 'Зелье силы', icon: '💪' },
            'xp-booster': { name: 'Бустер XP', icon: '✨' },
            'gold-booster': { name: 'Бустер золота', icon: '💰' }
        };

        const hasItems = Object.keys(inventory).some(key => inventory[key] > 0);

        if (!hasItems) {
            container.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state-text">Инвентарь пуст</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        Object.keys(inventory).forEach(itemId => {
            const quantity = inventory[itemId];
            if (quantity <= 0) return;

            const item = items[itemId];
            if (!item) return;

            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                <div class="inventory-item-icon">${item.icon}</div>
                <div class="inventory-item-name">${item.name}</div>
                <div class="inventory-item-qty">x${quantity}</div>
            `;
            itemEl.addEventListener('click', () => {
                if (itemId.includes('potion') || itemId.includes('booster')) {
                    Battle.openUseItemModal(itemId);
                }
            });
            container.appendChild(itemEl);
        });
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Изменение имени
        const editNameBtn = document.getElementById('edit-name-btn');
        if (editNameBtn) {
            editNameBtn.addEventListener('click', () => {
                const profile = Storage.getProfile();
                const newName = prompt('Введите новое имя:', profile.name);
                if (newName && newName.trim()) {
                    Storage.updateProfile({ name: newName.trim() });
                    this.render();
                    App.showNotification('Имя изменено!', 'success');
                }
            });
        }

        // Изменение аватара
        const editAvatarBtn = document.getElementById('edit-avatar-btn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => {
                const profile = Storage.getProfile();
                const ownedSkins = profile.skins || [profile.avatar];
                
                const message = 'Выберите аватар (введите номер):\n\n' +
                    ownedSkins.map((a, i) => `${i + 1}. ${a}`).join('\n') +
                    '\n\n' + 'Больше скинов в магазине! 🏪';

                const choice = prompt(message);
                if (choice) {
                    const index = parseInt(choice) - 1;
                    if (index >= 0 && index < ownedSkins.length) {
                        Storage.updateProfile({ equippedSkin: ownedSkins[index] });
                        this.render();
                        App.showNotification('Аватар изменён!', 'success');
                    }
                }
            });
        }

        // Сброс прогресса
        const resetBtn = document.getElementById('reset-progress-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Вы уверены? Весь прогресс будет потерян!')) {
                    Storage.resetProgress();
                    location.reload();
                }
            });
        }

        // Экспорт данных
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = Storage.exportData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `liferpg-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                App.showNotification('Данные экспортированы!', 'success');
            });
        }

        // Импорт данных
        const importBtn = document.getElementById('import-data-btn');
        const importFile = document.getElementById('import-file');

        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });

            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const success = Storage.importData(event.target.result);
                        if (success) {
                            App.showNotification('Данные импортированы!', 'success');
                            setTimeout(() => location.reload(), 1000);
                        } else {
                            App.showNotification('Ошибка импорта!', 'error');
                        }
                    };
                    reader.readAsText(file);
                }
                importFile.value = '';
            });
        }

        // Уведомления
        const toggleNotificationsBtn = document.getElementById('toggle-notifications-btn');
        if (toggleNotificationsBtn) {
            toggleNotificationsBtn.addEventListener('click', () => {
                const current = localStorage.getItem('liferpg_notifications');
                const newValue = current !== 'false';
                localStorage.setItem('liferpg_notifications', !newValue);
                toggleNotificationsBtn.textContent = newValue ? 'Выкл' : 'Вкл';
                App.showNotification(
                    newValue ? 'Уведомления отключены' : 'Уведомления включены',
                    'info'
                );
            });
        }
    },

    /**
     * Добавить XP и обновить профиль
     */
    addXp(amount, statType = null) {
        const profile = Storage.getProfile();
        const xpMultiplier = Storage.getXpMultiplier();
        const finalXp = Math.floor(amount * xpMultiplier);

        profile.xp += finalXp;
        profile.totalXp += finalXp;

        // Проверка повышения уровня
        const newLevel = Storage.calculateLevel(profile.xp);
        let leveledUp = false;

        if (newLevel > profile.level) {
            profile.level = newLevel;
            leveledUp = true;
            
            // Бонус за уровень
            profile.gold += newLevel * 10;
        }

        // Добавление характеристики
        if (statType && profile.stats[statType] !== undefined) {
            profile.stats[statType] += Math.floor(amount / 20);
        }

        // Удача увеличивается случайно
        if (Math.random() < 0.1) {
            profile.stats.luck += 1;
        }

        Storage.saveProfile(profile);
        this.updateUI(profile);

        return {
            leveledUp,
            newLevel,
            xpGained: finalXp
        };
    }
};
