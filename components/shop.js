/**
 * Shop Component
 * Компонент магазина
 */

const Shop = {
    /**
     * Товары магазина
     */
    items: {
        // Зелья
        'health-potion': {
            name: 'Зелье лечения',
            description: 'Восстанавливает 50 HP в бою',
            icon: '💚',
            price: 20,
            category: 'potions'
        },
        'mana-potion': {
            name: 'Зелье маны',
            description: '+20% к XP на 1 час',
            icon: '💙',
            price: 30,
            category: 'potions'
        },
        'strength-potion': {
            name: 'Зелье силы',
            description: '+50% урона в бою на 30 мин',
            icon: '💪',
            price: 25,
            category: 'potions'
        },
        // Бустеры
        'xp-booster': {
            name: 'Бустер XP',
            description: '+50% к XP на 1 час',
            icon: '✨',
            price: 50,
            category: 'boosters'
        },
        'gold-booster': {
            name: 'Бустер золота',
            description: '+50% золота в боях на 1 час',
            icon: '💰',
            price: 40,
            category: 'boosters'
        },
        // Скины
        'skin-warrior': {
            name: 'Скин: Воин',
            description: 'Аватар воина ⚔️',
            icon: '⚔️',
            price: 100,
            category: 'skins',
            skinAvatar: '🧑‍🎤'
        },
        'skin-mage': {
            name: 'Скин: Маг',
            description: 'Аватар мага 🧙',
            icon: '🧙',
            price: 100,
            category: 'skins',
            skinAvatar: '🧙‍♂️'
        },
        'skin-ninja': {
            name: 'Скин: Ниндзя',
            description: 'Аватар ниндзя 🥷',
            icon: '🥷',
            price: 150,
            category: 'skins',
            skinAvatar: '🥷'
        },
        'skin-elf': {
            name: 'Скин: Эльф',
            description: 'Аватар эльфа 🧝',
            icon: '🧝',
            price: 120,
            category: 'skins',
            skinAvatar: '🧝‍♂️'
        },
        'skin-demon': {
            name: 'Скин: Демон',
            description: 'Аватар демона 👿',
            icon: '👿',
            price: 200,
            category: 'skins',
            skinAvatar: '👿'
        },
        'skin-robot': {
            name: 'Скин: Робот',
            description: 'Аватар робота 🤖',
            icon: '🤖',
            price: 150,
            category: 'skins',
            skinAvatar: '🤖'
        }
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
        // Переключение вкладок
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.tab;
                this.switchTab(category);
            });
        });

        // Кнопки покупки
        document.querySelectorAll('.shop-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.currentTarget.closest('.shop-item');
                const itemId = item.dataset.item;
                this.buyItem(itemId);
            });
        });
    },

    /**
     * Переключение вкладки
     */
    switchTab(category) {
        // Обновляем вкладки
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === category);
        });

        // Обновляем категории
        document.querySelectorAll('.shop-category').forEach(cat => {
            cat.classList.toggle('active', cat.dataset.category === category);
        });
    },

    /**
     * Покупка предмета
     */
    buyItem(itemId) {
        const item = this.items[itemId];
        if (!item) return;

        const profile = Storage.getProfile();

        // Проверка: скины покупаются один раз
        if (item.category === 'skins') {
            if (profile.skins?.includes(item.skinAvatar)) {
                App.showNotification('У вас уже есть этот скин!', 'error');
                return;
            }

            if (profile.gold >= item.price) {
                profile.gold -= item.price;
                profile.skins = profile.skins || [];
                profile.skins.push(item.skinAvatar);
                Storage.saveProfile(profile);
                App.showNotification(`🎉 Куплен скин: ${item.name}!`, 'success');
                this.updateGold();
                Profile.render();
            } else {
                App.showNotification('Недостаточно золота!', 'error');
            }
            return;
        }

        // Покупка расходуемых предметов
        if (profile.gold >= item.price) {
            profile.gold -= item.price;
            Storage.saveProfile(profile);
            Storage.addItem(itemId, 1);
            App.showNotification(`🛒 Куплено: ${item.name}!`, 'success');
            this.updateGold();
            Profile.render();
        } else {
            App.showNotification('Недостаточно золота!', 'error');
        }
    },

    /**
     * Обновление золота в UI
     */
    updateGold() {
        const profile = Storage.getProfile();
        const goldEl = document.getElementById('shop-gold-count');
        if (goldEl) {
            goldEl.textContent = profile.gold;
        }
    },

    /**
     * Рендер магазина
     */
    render() {
        const profile = Storage.getProfile();
        this.updateGold();

        // Обновляем доступность кнопок
        document.querySelectorAll('.shop-item').forEach(itemEl => {
            const itemId = itemEl.dataset.item;
            const item = this.items[itemId];
            const btn = itemEl.querySelector('.shop-item-btn');

            if (!item) return;

            // Проверка для скинов
            if (item.category === 'skins') {
                if (profile.skins?.includes(item.skinAvatar)) {
                    btn.textContent = 'Куплено';
                    btn.disabled = true;
                    itemEl.style.opacity = '0.5';
                    return;
                }
            }

            // Проверка золота
            if (profile.gold < item.price) {
                btn.style.opacity = '0.5';
            } else {
                btn.style.opacity = '1';
            }

            btn.textContent = `Купить`;
            btn.disabled = false;
        });
    },

    /**
     * Использовать предмет из инвентаря
     */
    useItem(itemId) {
        const inventory = Storage.getInventory();
        if ((inventory[itemId] || 0) <= 0) {
            App.showNotification('Нет этого предмета!', 'error');
            return;
        }

        const item = this.items[itemId];
        if (!item) return;

        switch (itemId) {
            case 'health-potion':
                // Можно использовать только в бою
                if (Battle.state.active) {
                    Battle.useItem(itemId);
                } else {
                    App.showNotification('Используйте зелье в бою!', 'info');
                }
                break;

            case 'mana-potion':
                Storage.activateBooster('mana-potion', 60);
                Storage.useItem(itemId);
                App.showNotification('💙 Зелье маны активировано! +20% XP на 1 час', 'success');
                Profile.render();
                break;

            case 'strength-potion':
                Storage.activateBooster('strength-potion', 30);
                Storage.useItem(itemId);
                App.showNotification('💪 Зелье силы активировано! +50% урона на 30 мин', 'success');
                Profile.render();
                break;

            case 'xp-booster':
                Storage.activateBooster('xp-booster', 60);
                Storage.useItem(itemId);
                App.showNotification('✨ Бустер XP активирован! +50% XP на 1 час', 'success');
                Profile.render();
                break;

            case 'gold-booster':
                Storage.activateBooster('gold-booster', 60);
                Storage.useItem(itemId);
                App.showNotification('💰 Бустер золота активирован! +50% золота на 1 час', 'success');
                Profile.render();
                break;
        }
    }
};
