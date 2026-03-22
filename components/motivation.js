/**
 * Motivation Component v2.0
 * Система мотивационных цитат для LifeRPG
 * Вдохновляет пользователя на достижение целей
 */

const Motivation = {
    /**
     * Коллекция цитат по категориям
     */
    quotes: {
        success: [
            { text: "Путь в тысячу ли начинается с первого шага", author: "Лао-цзы" },
            { text: "Не важно, как медленно ты идешь, главное, что ты не останавливаешься", author: "Конфуций" },
            { text: "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма", author: "Уинстон Черчилль" },
            { text: "Лучшее время, чтобы посадить дерево, было 20 лет назад. Следующее лучшее время — сегодня", author: "Китайская пословица" },
            { text: "Ваше время ограничено, не тратьте его, живя чужой жизнью", author: "Стив Джобс" }
        ],
        productivity: [
            { text: "Сложнее всего начать действовать, все остальное зависит только от упорства", author: "Амелия Эдхарт" },
            { text: "Логика приведет вас из пункта А в пункт Б. Воображение приведет вас куда угодно", author: "Альберт Эйнштейн" },
            { text: "Через 20 лет вы будете больше жалеть о том, чего не сделали, чем о том, что сделали", author: "Марк Твен" },
            { text: "Не откладывай на завтра то, что можешь сделать сегодня", author: "Бенджамин Франклин" },
            { text: "Дисциплина — это решение делать то, чего очень не хочется делать, чтобы достичь того, чего очень хочется достичь", author: "Джон Максвелл" }
        ],
        learning: [
            { text: "Век живи — век учись", author: "Русская пословица" },
            { text: "Образование — это самое мощное оружие, которое вы можете использовать, чтобы изменить мир", author: "Нельсон Мандела" },
            { text: "Учение — свет, а неучение — тьма", author: "Народная мудрость" },
            { text: "Знание — сила", author: "Фрэнсис Бэкон" },
            { text: "Никогда не стыдись учиться новому. Знания не имеют веса", author: "Африканская пословица" }
        ],
        health: [
            { text: "Здоровье — это не все, но все без здоровья — ничто", author: "Сократ" },
            { text: "Движение — это жизнь", author: "Народная мудрость" },
            { text: "В здоровом теле — здоровый дух", author: "Ювенал" },
            { text: "Инвестиции в здоровье приносят наилучшие дивиденды", author: "Бенджамин Франклин" },
            { text: "Первый шаг к здоровью — это желание быть здоровым", author: "Лукреций" }
        ],
        creativity: [
            { text: "Творчество — это интеллект, получающий удовольствие", author: "Альберт Эйнштейн" },
            { text: "Каждый ребенок — художник. Трудность в том, чтобы остаться художником, выйдя из детского возраста", author: "Пабло Пикассо" },
            { text: "Креативность — это видеть то, что видят все, но думать по-другому", author: "Роберт Фрост" },
            { text: "Воображение важнее знаний", author: "Альберт Эйнштейн" },
            { text: "Искусство смывает с души пыль повседневной жизни", author: "Пабло Пикассо" }
        ],
        motivation: [
            { text: "Единственный способ сделать выдающуюся работу — любить то, что делаешь", author: "Стив Джобс" },
            { text: "Не ждите. Время никогда не будет идеальным", author: "Наполеон Хилл" },
            { text: "Вы становитесь тем, о чем думаете", author: "Наполеон Хилл" },
            { text: "Победа — это еще не все, все — это постоянное стремление к победе", author: "Винс Ломбарди" },
            { text: "Если ты проходишь через ад — иди не останавливаясь", author: "Уинстон Черчилль" }
        ]
    },

    /**
     * Инициализация
     */
    init() {
        this.showDailyQuote();
        this.bindEvents();
    },

    /**
     * Показать цитату дня
     */
    showDailyQuote() {
        const today = new Date().toDateString();
        const lastQuoteDate = localStorage.getItem('liferpg_quote_date');
        
        // Показываем новую цитату каждый день
        if (lastQuoteDate !== today || !this.currentQuote) {
            const categories = Object.keys(this.quotes);
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const categoryQuotes = this.quotes[randomCategory];
            this.currentQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
            
            localStorage.setItem('liferpg_quote_date', today);
            localStorage.setItem('liferpg_current_quote', JSON.stringify(this.currentQuote));
        } else {
            this.currentQuote = JSON.parse(localStorage.getItem('liferpg_current_quote'));
        }

        this.renderQuote();
    },

    /**
     * Рендер цитаты
     */
    renderQuote() {
        const container = document.getElementById('daily-quote');
        if (!container || !this.currentQuote) return;

        container.innerHTML = `
            <div class="quote-icon">💬</div>
            <div class="quote-text">"${this.currentQuote.text}"</div>
            <div class="quote-author">— ${this.currentQuote.author}</div>
            <button class="quote-refresh" id="quote-refresh-btn" aria-label="Новая цитата">
                🔄
            </button>
        `;

        this.bindEvents();
    },

    /**
     * Показать случайную цитату
     */
    showRandomQuote() {
        const categories = Object.keys(this.quotes);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryQuotes = this.quotes[randomCategory];
        this.currentQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
        
        this.renderQuote();
        
        // Сохраняем как новую цитату дня
        localStorage.setItem('liferpg_current_quote', JSON.stringify(this.currentQuote));
        localStorage.setItem('liferpg_quote_date', new Date().toDateString());
    },

    /**
     * Получить цитату по категории
     */
    getQuoteByCategory(category) {
        const quotes = this.quotes[category] || this.quotes.motivation;
        return quotes[Math.floor(Math.random() * quotes.length)];
    },

    /**
     * Привязка событий
     */
    bindEvents() {
        const refreshBtn = document.getElementById('quote-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.showRandomQuote();
            });
        }
    },

    /**
     * Получить мотивационное сообщение для выполнения задачи
     */
    getTaskCompletionMessage(taskType) {
        const messages = {
            study: [
                "📚 Знания — это сила! Продолжай учиться!",
                "🧠 Каждый шаг делает тебя мудрее!",
                "🎓 Образование открывает все двери!"
            ],
            sport: [
                "💪 Сила в движении! Так держать!",
                "🏃 Твое тело — твой храм!",
                "🔥 Боль временна, слава вечна!"
            ],
            creative: [
                "🎨 Творчество — это твоя суперсила!",
                "✨ Ты создаешь что-то прекрасное!",
                "🌟 Воображение не знает границ!"
            ],
            other: [
                "✅ Еще один шаг к лучшей версии себя!",
                "🎯 Цель достигнута! Гордись собой!",
                "🚀 Прогресс — это прогресс!"
            ]
        };

        const typeMessages = messages[taskType] || messages.other;
        return typeMessages[Math.floor(Math.random() * typeMessages.length)];
    },

    /**
     * Получить утреннее приветствие
     */
    getMorningGreeting() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            const greetings = [
                "☀️ Доброе утро! Новый день — новые возможности!",
                "🌅 Просыпайся и побеждай! Сегодня твой день!",
                "🌞 Утро начинается не с кофе, а с правильной цели!"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        } else if (hour >= 12 && hour < 17) {
            const greetings = [
                "🌤️ Добрый день! Продуктивного продолжения!",
                "⛽ Полдень — время для новых свершений!",
                "🔥 День в разгаре! Используй его по максимуму!"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        } else if (hour >= 17 && hour < 23) {
            const greetings = [
                "🌆 Добрый вечер! Заверши день с победой!",
                "🌇 Вечер — время подводить итоги!",
                "✨ Еще есть время сделать что-то великое!"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        } else {
            const greetings = [
                "🌙 Доброй ночи! Трудоголик тоже нуждается в отдыхе!",
                "⭐ Ночные свершения достойны уважения!",
                "🦉 Совиный режим — режим чемпионов!"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
    }
};
