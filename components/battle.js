/**
 * Battle Component
 * Компонент карточного боя
 */

const Battle = {
    // Конфигурация
    config: {
        easy: { enemyHp: 50, enemyName: 'Гоблин', enemyAvatar: '👺', xpReward: 30, goldReward: 10 },
        normal: { enemyHp: 100, enemyName: 'Орк', enemyAvatar: '👹', xpReward: 60, goldReward: 25 },
        hard: { enemyHp: 200, enemyName: 'Дракон', enemyAvatar: '🐉', xpReward: 150, goldReward: 50 },
        // Новые типы монстров для разнообразия
        monsters: [
            { name: 'Гоблин', avatar: '👺', minHp: 40, maxHp: 60 },
            { name: 'Орк', avatar: '👹', minHp: 80, maxHp: 120 },
            { name: 'Скелет', avatar: '💀', minHp: 60, maxHp: 90 },
            { name: 'Призрак', avatar: '👻', minHp: 70, maxHp: 100 },
            { name: 'Дракон', avatar: '🐉', minHp: 180, maxHp: 250 },
            { name: 'Демон', avatar: '👿', minHp: 150, maxHp: 200 },
            { name: 'Робот', avatar: '🤖', minHp: 100, maxHp: 150 },
            { name: 'Инопланетянин', avatar: '👽', minHp: 90, maxHp: 130 },
            { name: 'Зомби', avatar: '🧟', minHp: 80, maxHp: 120 },
            { name: 'Вампир', avatar: '🧛', minHp: 100, maxHp: 140 }
        ]
    },

    // Состояние боя
    state: {
        active: false,
        difficulty: null,
        playerHp: 100,
        playerMaxHp: 100,
        enemyHp: 100,
        enemyMaxHp: 100,
        enemy: null,
        selectedTasks: [],
        turn: 0
    },

    /**
     * Инициализация
     */
    init() {
        this.bindEvents();
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        // Выбор сложности
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });

        // Кнопки боя
        document.getElementById('battle-attack')?.addEventListener('click', () => this.attack());
        document.getElementById('battle-heal')?.addEventListener('click', () => this.heal());
        document.getElementById('battle-flee')?.addEventListener('click', () => this.flee());
        document.getElementById('battle-continue')?.addEventListener('click', () => this.reset());

        // Закрытие модалки использования предмета
        document.getElementById('use-item-modal-close')?.addEventListener('click', () => {
            document.getElementById('use-item-modal').classList.remove('active');
        });
    },

    /**
     * Выбор сложности
     */
    selectDifficulty(difficulty) {
        const config = this.config[difficulty];
        if (!config) return;

        // Выбираем случайного монстра из списка
        const randomMonster = this.getRandomMonsterForDifficulty(difficulty);

        // Обновляем UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.difficulty === difficulty);
        });

        // Инициализация состояния
        this.state.active = true;
        this.state.difficulty = difficulty;
        this.state.enemy = {
            ...config,
            difficulty,
            enemyName: randomMonster.name,
            enemyAvatar: randomMonster.avatar
        };
        this.state.enemyHp = config.enemyHp;
        this.state.enemyMaxHp = config.enemyHp;
        this.state.playerHp = this.state.playerMaxHp;
        this.state.selectedTasks = [];

        // Обновляем UI врага
        const enemyAvatarEl = document.getElementById('enemy-avatar');
        const enemyNameEl = document.getElementById('enemy-name');
        const enemyHpEl = document.getElementById('enemy-hp');
        const enemyMaxHpEl = document.getElementById('enemy-max-hp');
        const enemyHpFillEl = document.getElementById('enemy-hp-fill');
        
        if (enemyAvatarEl) enemyAvatarEl.textContent = randomMonster.avatar;
        if (enemyNameEl) enemyNameEl.textContent = randomMonster.name;
        if (enemyHpEl) enemyHpEl.textContent = config.enemyHp;
        if (enemyMaxHpEl) enemyMaxHpEl.textContent = config.enemyHp;
        if (enemyHpFillEl) enemyHpFillEl.style.width = '100%';

        // Показываем сцену боя
        const difficultyEl = document.getElementById('battle-difficulty');
        const sceneEl = document.getElementById('battle-scene');
        const resultEl = document.getElementById('battle-result');
        
        if (difficultyEl) difficultyEl.style.display = 'none';
        if (sceneEl) sceneEl.style.display = 'block';
        if (resultEl) resultEl.style.display = 'none';

        // Загружаем задачи для боя
        this.loadBattleTasks();
        this.addLog(`⚔️ Бой начался! На вас напал ${randomMonster.name}!`);
    },

    /**
     * Получить случайного монстра для сложности
     */
    getRandomMonsterForDifficulty(difficulty) {
        const monsters = this.config.monsters;
        let filteredMonsters;
        
        // Фильтруем монстров по сложности
        if (difficulty === 'easy') {
            filteredMonsters = monsters.filter(m => m.maxHp <= 70);
        } else if (difficulty === 'normal') {
            filteredMonsters = monsters.filter(m => m.minHp >= 60 && m.maxHp <= 130);
        } else {
            filteredMonsters = monsters.filter(m => m.minHp >= 100);
        }
        
        // Если нет подходящих, берем случайного
        if (filteredMonsters.length === 0) {
            filteredMonsters = monsters;
        }
        
        return filteredMonsters[Math.floor(Math.random() * filteredMonsters.length)];
    },

    /**
     * Загрузка задач для боя
     */
    loadBattleTasks() {
        const tasks = Storage.getActiveTasks().slice(0, 10);
        const container = document.getElementById('battle-tasks-list');

        if (tasks.length === 0) {
            if (container) {
                container.innerHTML = '<p class="empty-state-text">Нет доступных задач. Создайте задачи сначала!</p>';
            }
            const attackBtn = document.getElementById('battle-attack');
            const healBtn = document.getElementById('battle-heal');
            if (attackBtn) attackBtn.disabled = true;
            if (healBtn) healBtn.disabled = true;
            return;
        }

        if (container) {
            container.innerHTML = '';
            tasks.forEach(task => {
                const card = Card.createBattleCard(task, false);
                if (card) {
                    card.addEventListener('click', () => this.toggleTaskSelection(task, card));
                    container.appendChild(card);
                }
            });
        }

        const attackBtn = document.getElementById('battle-attack');
        const healBtn = document.getElementById('battle-heal');
        if (attackBtn) attackBtn.disabled = true;
        if (healBtn) healBtn.disabled = true;
    },

    /**
     * Переключение выбора задачи
     */
    toggleTaskSelection(task, card) {
        if (!task || !card) return;
        
        const index = this.state.selectedTasks.findIndex(t => t.id === task.id);

        if (index !== -1) {
            // Удалить из выбора
            this.state.selectedTasks.splice(index, 1);
            card.classList.remove('selected');
            const checkbox = card.querySelector('.battle-task-checkbox');
            if (checkbox) checkbox.textContent = '';
        } else {
            // Добавить к выбору
            this.state.selectedTasks.push(task);
            card.classList.add('selected');
            const checkbox = card.querySelector('.battle-task-checkbox');
            if (checkbox) checkbox.textContent = '✅';
        }

        // Обновить состояние кнопок
        const hasSelected = this.state.selectedTasks.length > 0;
        const attackBtn = document.getElementById('battle-attack');
        const healBtn = document.getElementById('battle-heal');
        
        if (attackBtn) attackBtn.disabled = !hasSelected;
        if (healBtn) healBtn.disabled = !hasSelected;
    },

    /**
     * Атака
     */
    attack() {
        if (this.state.selectedTasks.length === 0) return;

        const profile = Storage.getProfile();
        const damageMultiplier = Storage.getDamageMultiplier();

        // Считаем урон от выбранных задач
        let totalDamage = this.state.selectedTasks.reduce((sum, task) => sum + task.xp, 0);

        // Критический урон от удачи
        const critChance = Math.min(0.3, (profile.stats.luck || 0) * 0.01);
        const isCrit = Math.random() < critChance;

        if (isCrit) {
            totalDamage = Math.floor(totalDamage * 1.5);
        }

        totalDamage = Math.floor(totalDamage * damageMultiplier);

        // Наносим урон врагу
        this.state.enemyHp = Math.max(0, this.state.enemyHp - totalDamage);
        this.updateEnemyHp();
        this.addLog(`⚔️ Вы атаковали на <strong class="damage">${totalDamage}</strong> урона!${isCrit ? ' <strong class="crit">КРИТ!</strong>' : ''}`);

        // Помечаем задачи как выполненные
        this.state.selectedTasks.forEach(task => {
            if (App.currentCompletingTask !== task.id) {
                App.finalizeTaskCompletion(task.id);
            }
        });

        this.state.selectedTasks = [];
        
        // Обновляем UI карточек
        document.querySelectorAll('.battle-task-item').forEach(card => {
            card.classList.remove('selected');
            const checkbox = card.querySelector('.battle-task-checkbox');
            if (checkbox) checkbox.textContent = '';
        });
        
        const attackBtn = document.getElementById('battle-attack');
        const healBtn = document.getElementById('battle-heal');
        if (attackBtn) attackBtn.disabled = true;
        if (healBtn) healBtn.disabled = true;

        // Проверка победы
        if (this.state.enemyHp <= 0) {
            setTimeout(() => this.victory(), 500);
            return;
        }

        // Ответ врага
        setTimeout(() => this.enemyTurn(), 800);
    },

    /**
     * Ход врага
     */
    enemyTurn() {
        const enemy = this.state.enemy;
        const profile = Storage.getProfile();

        // Урон врага (зависит от сложности)
        const baseDamage = enemy.difficulty === 'easy' ? 10 : enemy.difficulty === 'normal' ? 20 : 35;
        
        // Защита от характеристик
        const defense = Math.floor((profile.stats.strength + profile.stats.intellect) * 0.5);
        const damage = Math.max(5, baseDamage - defense);

        this.state.playerHp = Math.max(0, this.state.playerHp - damage);
        this.updatePlayerHp();
        this.addLog(`👹 ${enemy.enemyName} атакует на <strong class="damage">${damage}</strong> урона!`);

        // Анимация получения урона
        document.querySelector('.battle-player').classList.add('damage-shake');
        setTimeout(() => {
            document.querySelector('.battle-player').classList.remove('damage-shake');
        }, 500);

        // Проверка поражения
        if (this.state.playerHp <= 0) {
            setTimeout(() => this.defeat(), 500);
        }
    },

    /**
     * Лечение
     */
    heal() {
        const inventory = Storage.getInventory();
        const healthPotions = inventory['health-potion'] || 0;

        if (healthPotions <= 0) {
            App.showNotification('Нет зелий лечения! Купите в магазине.', 'error');
            return;
        }

        // Используем зелье
        Storage.useItem('health-potion');
        
        // Восстанавливаем HP
        const healAmount = 50;
        this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + healAmount);
        this.updatePlayerHp();
        this.addLog(`💚 Вы использовали зелье и восстановили <strong class="heal">${healAmount}</strong> HP!`);

        // Обновляем инвентарь в UI
        Profile.render();

        // Ответ врага
        setTimeout(() => this.enemyTurn(), 800);
    },

    /**
     * Побег
     */
    flee() {
        if (confirm('Вы уверены, что хотите сбежать? Вы потеряете прогресс боя.')) {
            this.addLog('🏃 Вы сбежали с поля боя...');
            setTimeout(() => this.reset(), 1000);
        }
    },

    /**
     * Победа
     */
    victory() {
        const config = this.config[this.state.difficulty];
        const profile = Storage.getProfile();

        // Награды
        const xpMultiplier = Storage.getXpMultiplier();
        const xpReward = Math.floor(config.xpReward * xpMultiplier);
        const goldMultiplier = (profile.activeBoosters || []).find(b => b.type === 'gold-booster') ? 1.5 : 1;
        const goldReward = Math.floor(config.goldReward * goldMultiplier);

        // Обновляем профиль
        profile.battlesWon++;
        profile.gold += goldReward;
        profile.totalGold += goldReward;
        Storage.saveProfile(profile);

        // Обновляем статистику боя
        if (typeof Statistics !== 'undefined') {
            Statistics.onBattleResult(
                true, // победа
                this.state.enemyMaxHp, // урон нанесенный врагу
                this.state.playerMaxHp - this.state.playerHp, // полученный урон
                false, // крит (упрощенно)
                goldReward,
                xpReward
            );
        }

        // Проверяем достижения
        Achievements.checkAndUpdate(profile);

        // Показываем результат
        document.getElementById('battle-scene').style.display = 'none';
        document.getElementById('battle-result').style.display = 'block';
        document.getElementById('result-icon').textContent = '🏆';
        document.getElementById('result-title').textContent = 'Победа!';
        document.getElementById('result-description').textContent = `Вы победили ${this.state.enemy.enemyName}!`;
        document.getElementById('result-xp').textContent = xpReward;
        document.getElementById('result-gold').textContent = goldReward;

        // Добавляем награды
        Profile.addXp(xpReward);
        App.showNotification(`🏆 Победа! +${xpReward} XP, +${goldReward} 💰`, 'success');
    },

    /**
     * Поражение
     */
    defeat() {
        const profile = Storage.getProfile();
        profile.battlesLost++;
        Storage.saveProfile(profile);

        // Обновляем статистику боя
        if (typeof Statistics !== 'undefined') {
            Statistics.onBattleResult(
                false, // поражение
                this.state.enemyMaxHp - this.state.enemyHp, // урон нанесенный врагу
                this.state.playerMaxHp, // полученный урон
                false, // крит
                0,
                0
            );
        }

        // Показываем результат
        document.getElementById('battle-scene').style.display = 'none';
        document.getElementById('battle-result').style.display = 'block';
        document.getElementById('result-icon').textContent = '💀';
        document.getElementById('result-title').textContent = 'Поражение...';
        document.getElementById('result-description').textContent = 'Вы проиграли этот бой. Попробуйте снова!';
        document.getElementById('result-xp').textContent = '0';
        document.getElementById('result-gold').textContent = '0';

        App.showNotification('💀 Поражение... Попробуйте снова!', 'error');
    },

    /**
     * Сброс боя
     */
    reset() {
        this.state = {
            active: false,
            difficulty: null,
            playerHp: 100,
            playerMaxHp: 100,
            enemyHp: 100,
            enemyMaxHp: 100,
            enemy: null,
            selectedTasks: [],
            turn: 0
        };

        document.getElementById('battle-difficulty').style.display = 'block';
        document.getElementById('battle-scene').style.display = 'none';
        document.getElementById('battle-result').style.display = 'none';
        document.getElementById('battle-log').innerHTML = '';
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    },

    /**
     * Обновление HP игрока
     */
    updatePlayerHp() {
        const percent = (this.state.playerHp / this.state.playerMaxHp) * 100;
        document.getElementById('player-hp').textContent = this.state.playerHp;
        document.getElementById('player-max-hp').textContent = this.state.playerMaxHp;
        document.getElementById('player-hp-fill').style.width = `${percent}%`;
    },

    /**
     * Обновление HP врага
     */
    updateEnemyHp() {
        const percent = (this.state.enemyHp / this.state.enemyMaxHp) * 100;
        document.getElementById('enemy-hp').textContent = this.state.enemyHp;
        document.getElementById('enemy-hp-fill').style.width = `${percent}%`;
    },

    /**
     * Добавление записи в лог
     */
    addLog(message) {
        const log = document.getElementById('battle-log');
        const entry = document.createElement('div');
        entry.className = 'battle-log-entry';
        entry.innerHTML = message;
        
        // Добавляем класс для критических ударов
        if (message.includes('КРИТ!')) {
            entry.classList.add('crit-hit');
        }
        
        log.insertBefore(entry, log.firstChild);

        // Ограничиваем количество записей
        while (log.children.length > 20) {
            log.removeChild(log.lastChild);
        }
    },

    /**
     * Открыть модалку использования предмета
     */
    openUseItemModal(itemId) {
        const items = {
            'health-potion': {
                name: 'Зелье лечения',
                icon: '💚',
                desc: 'Восстанавливает 50 HP'
            },
            'mana-potion': {
                name: 'Зелье маны',
                icon: '💙',
                desc: '+20% к XP на 1 час'
            },
            'strength-potion': {
                name: 'Зелье силы',
                icon: '💪',
                desc: '+50% урона на 30 минут'
            }
        };

        const item = items[itemId];
        if (!item) return;

        const content = document.getElementById('use-item-content');
        content.innerHTML = `
            <div class="use-item-info">
                <div class="use-item-icon">${item.icon}</div>
                <div class="use-item-name">${item.name}</div>
                <div class="use-item-desc">${item.desc}</div>
            </div>
            <div class="use-item-actions">
                <button class="btn-cancel" onclick="document.getElementById('use-item-modal').classList.remove('active')">Отмена</button>
                <button class="btn-submit" onclick="Battle.useItem('${itemId}')">Использовать</button>
            </div>
        `;

        document.getElementById('use-item-modal').classList.add('active');
    },

    /**
     * Использовать предмет
     */
    useItem(itemId) {
        const inventory = Storage.getInventory();
        if ((inventory[itemId] || 0) <= 0) {
            App.showNotification('Нет этого предмета!', 'error');
            return;
        }

        switch (itemId) {
            case 'health-potion':
                if (this.state.active) {
                    const healAmount = 50;
                    this.state.playerHp = Math.min(this.state.playerMaxHp, this.state.playerHp + healAmount);
                    this.updatePlayerHp();
                    this.addLog(`💚 Вы использовали зелье и восстановили <strong class="heal">${healAmount}</strong> HP!`);
                } else {
                    App.showNotification('Используйте в бою!', 'error');
                }
                break;

            case 'mana-potion':
                Storage.activateBooster('mana-potion', 60);
                App.showNotification('💙 Зелье маны активировано! +20% XP на 1 час', 'success');
                break;

            case 'strength-potion':
                Storage.activateBooster('strength-potion', 30);
                App.showNotification('💪 Зелье силы активировано! +50% урона на 30 мин', 'success');
                break;
        }

        Storage.useItem(itemId);
        document.getElementById('use-item-modal').classList.remove('active');
        Profile.render();
    }
};
