/**
 * Leaderboard Component v2.1
 * Таблица лидеров для LifeRPG
 * Позволяет соревноваться с друзьями и другими игроками
 */

const Leaderboard = {
    /**
     * Инициализация
     */
    init() {
        // Проверка инициализации
        if (!this.players) {
            this.players = [];
        }
        
        this.loadLeaderboard();
        this.render();
        this.bindEvents();
    },

    /**
     * Загрузка таблицы лидеров
     */
    loadLeaderboard() {
        const leaderboard = localStorage.getItem('liferpg_leaderboard_v2');
        
        if (!leaderboard) {
            // Создаём тестовых игроков для демонстрации
            this.players = this.generateDemoPlayers();
            this.saveLeaderboard();
        } else {
            this.players = JSON.parse(leaderboard);
        }

        // Добавляем текущего игрока если нет
        this.ensureCurrentPlayerExists();
    },

    /**
     * Генерация демо-игроков
     */
    generateDemoPlayers() {
        const names = [
            { name: 'Алексей', avatar: '🧙‍♂️', level: 25 },
            { name: 'Мария', avatar: '🧚‍♀️', level: 22 },
            { name: 'Дмитрий', avatar: '⚔️', level: 19 },
            { name: 'Елена', avatar: '👸', level: 17 },
            { name: 'Максим', avatar: '🦸', level: 15 },
            { name: 'Анна', avatar: '🦹‍♀️', level: 13 },
            { name: 'Сергей', avatar: '🧛', level: 11 },
            { name: 'Ольга', avatar: '🧜‍♀️', level: 9 },
            { name: 'Павел', avatar: '🧞', level: 7 },
            { name: 'Наталья', avatar: '🧙‍♀️', level: 5 }
        ];

        return names.map((player, index) => ({
            id: 'demo_' + index,
            name: player.name,
            avatar: player.avatar,
            level: player.level,
            xp: player.level * 100 + Math.floor(Math.random() * 100),
            tasksCompleted: player.level * 5 + Math.floor(Math.random() * 20),
            battlesWon: Math.floor(player.level * 1.5),
            streak: Math.floor(player.level * 0.8),
            isCurrentPlayer: false
        }));
    },

    /**
     * Проверка текущего игрока
     */
    ensureCurrentPlayerExists() {
        const profile = Storage.getProfile();
        if (!profile) return;

        // Сначала удаляем старого текущего игрока если есть
        this.players = this.players.filter(p => !p.isCurrentPlayer);

        // Добавляем актуальные данные текущего игрока
        this.players.unshift({
            id: 'current_player',
            name: profile.name,
            avatar: profile.equippedSkin || profile.avatar,
            level: profile.level,
            xp: profile.totalXp,
            tasksCompleted: profile.tasksCompleted,
            battlesWon: profile.battlesWon || 0,
            streak: profile.streak,
            isCurrentPlayer: true
        });
        
        this.sortPlayers();
        this.saveLeaderboard();
    },

    /**
     * Сортировка игроков
     */
    sortPlayers() {
        this.players.sort((a, b) => {
            // Сначала по уровню, потом по XP
            if (b.level !== a.level) return b.level - a.level;
            return b.xp - a.xp;
        });
    },

    /**
     * Сохранение таблицы лидеров
     */
    saveLeaderboard() {
        localStorage.setItem('liferpg_leaderboard_v2', JSON.stringify(this.players));
    },

    /**
     * Рендер таблицы лидеров
     */
    render() {
        const container = document.getElementById('leaderboard-list');
        if (!container) return;

        // Обновляем данные текущего игрока перед рендером
        this.ensureCurrentPlayerExists();

        const top3 = this.players.slice(0, 3);
        const rest = this.players.slice(3);

        container.innerHTML = `
            <!-- Топ 3 -->
            <div class="leaderboard-top3">
                ${this.renderPlayer(top3[1], 2)}
                ${this.renderPlayer(top3[0], 1)}
                ${this.renderPlayer(top3[2], 3)}
            </div>
            
            <!-- Остальные игроки -->
            <div class="leaderboard-list">
                ${rest.map((player, index) => this.renderPlayer(player, index + 4)).join('')}
            </div>
            
            <!-- Твоя позиция -->
            ${this.renderCurrentPlayerPosition()}
        `;
    },

    /**
     * Рендер карточки игрока
     */
    renderPlayer(player, rank) {
        if (!player) return '';

        const rankStyles = {
            1: 'gold',
            2: 'silver',
            3: 'bronze'
        };

        const rankClass = rankStyles[rank] || '';
        const rankIcon = rank <= 3 ? this.getRankIcon(rank) : `#${rank}`;
        const isCurrentPlayer = player.isCurrentPlayer ? 'current-player' : '';

        return `
            <div class="leaderboard-player ${rankClass} ${isCurrentPlayer}" data-id="${player.id}">
                <div class="leaderboard-rank">${rankIcon}</div>
                <div class="leaderboard-avatar">${player.avatar}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${player.name} ${isCurrentPlayer ? '(Вы)' : ''}</div>
                    <div class="leaderboard-stats">
                        <span class="lb-stat">⚡ ${player.level} ур.</span>
                        <span class="lb-stat">✅ ${player.tasksCompleted}</span>
                        <span class="lb-stat">🔥 ${player.streak}</span>
                    </div>
                </div>
                <div class="leaderboard-xp">${player.xp} XP</div>
            </div>
        `;
    },

    /**
     * Рендер позиции текущего игрока
     */
    renderCurrentPlayerPosition() {
        const currentPlayer = this.players.find(p => p.isCurrentPlayer);
        if (!currentPlayer) return '';

        const rank = this.players.indexOf(currentPlayer) + 1;
        const totalPlayers = this.players.length;

        return `
            <div class="leaderboard-footer">
                <div class="leaderboard-footer-text">
                    Твоя позиция: <strong>#${rank}</strong> из ${totalPlayers} игроков
                </div>
                <button class="btn-refresh-leaderboard" id="refresh-leaderboard-btn">
                    🔄 Обновить
                </button>
            </div>
        `;
    },

    /**
     * Получить иконку ранга
     */
    getRankIcon(rank) {
        const icons = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };
        return icons[rank] || `#${rank}`;
    },

    /**
     * Обновить таблицу лидеров
     */
    refresh() {
        this.loadLeaderboard();
        this.ensureCurrentPlayerExists();
        this.render();
        this.bindEvents();
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        const refreshBtn = document.getElementById('refresh-leaderboard-btn');
        if (refreshBtn && !refreshBtn.dataset.bound) {
            refreshBtn.dataset.bound = 'true';
            refreshBtn.addEventListener('click', () => {
                this.refresh();
                App.showNotification('Таблица лидеров обновлена!', 'success');
            });
        }
    }
};
