"""
RPG логика для LifeRPG Bot
"""

from typing import Dict, Tuple


# Конфигурация RPG
XP_PER_LEVEL = 100
BASE_GOLD = 10

# Типы задач и характеристики
TASK_STATS = {
    'study': 'intellect',
    'sport': 'strength',
    'creative': 'creative',
    'other': 'intellect'
}

# Предметы магазина
SHOP_ITEMS = {
    'health_potion': {
        'name': 'Зелье лечения',
        'description': 'Восстанавливает HP в бою',
        'price': 20,
        'icon': '💚'
    },
    'mana_potion': {
        'name': 'Зелье маны',
        'description': '+20% к XP на 1 час',
        'price': 30,
        'icon': '💙'
    },
    'strength_potion': {
        'name': 'Зелье силы',
        'description': '+50% урона на 30 мин',
        'price': 25,
        'icon': '💪'
    },
    'xp_booster': {
        'name': 'Бустер XP',
        'description': '+50% к XP на 1 час',
        'price': 50,
        'icon': '✨'
    },
    'gold_booster': {
        'name': 'Бустер золота',
        'description': '+50% золота на 1 час',
        'price': 40,
        'icon': '💰'
    }
}

# Достижения
ACHIEVEMENTS = [
    {'key': 'first_task', 'name': 'Первый шаг', 'description': 'Выполните первую задачу', 'icon': '🎯'},
    {'key': 'task_10', 'name': 'Мастер задач', 'description': 'Выполните 10 задач', 'icon': '⭐'},
    {'key': 'task_50', 'name': 'Легенда задач', 'description': 'Выполните 50 задач', 'icon': '🏆'},
    {'key': 'level_5', 'name': 'Опытный игрок', 'description': 'Достигните 5 уровня', 'icon': '🎮'},
    {'key': 'level_10', 'name': 'Ветеран', 'description': 'Достигните 10 уровня', 'icon': '⚔️'},
    {'key': 'streak_3', 'name': 'Три дня подряд', 'description': 'Стрик 3 дня', 'icon': '🔥'},
    {'key': 'streak_7', 'name': 'Недельный марафон', 'description': 'Стрик 7 дней', 'icon': '💪'},
    {'key': 'gold_100', 'name': 'Богач', 'description': 'Заработайте 100 золота', 'icon': '💰'},
]


def calculate_level(total_xp: int) -> int:
    """Расчет уровня по опыту"""
    return (total_xp // XP_PER_LEVEL) + 1


def calculate_xp_to_next(total_xp: int) -> int:
    """Опыт до следующего уровня"""
    return XP_PER_LEVEL - (total_xp % XP_PER_LEVEL)


def calculate_stat_gain(xp: int) -> int:
    """Расчет прироста характеристики"""
    return max(1, xp // 20)


def calculate_gold_reward(difficulty: int, has_booster: bool = False) -> int:
    """Расчет награды золотом"""
    base = BASE_GOLD * difficulty
    if has_booster:
        base = int(base * 1.5)
    return base


def calculate_xp_reward(base_xp: int, difficulty: int, has_booster: bool = False) -> int:
    """Расчет награды опытом"""
    base = base_xp * difficulty
    if has_booster:
        base = int(base * 1.5)
    return base


def get_stat_by_category(category: str) -> str:
    """Получить характеристику по категории задачи"""
    return TASK_STATS.get(category, 'intellect')


def get_title_by_level(level: int) -> Tuple[str, str]:
    """Получить звание по уровню"""
    titles = [
        (1, 'Новичок', '🌱'),
        (5, 'Ученик', '📖'),
        (10, 'Адепт', '⚡'),
        (15, 'Маг', '🔮'),
        (20, 'Архимаг', '🌟'),
        (25, 'Легенда', '👑'),
        (30, 'Божество', '✨'),
    ]

    for req_level, title, icon in reversed(titles):
        if level >= req_level:
            return title, icon

    return 'Новичок', '🌱'


def check_achievements(user: dict, action: str, value: int) -> list:
    """Проверка достижений"""
    unlocked = []

    for ach in ACHIEVEMENTS:
        should_unlock = False

        if ach['key'] == 'first_task' and action == 'task_completed' and value >= 1:
            should_unlock = True
        elif ach['key'] == 'task_10' and action == 'task_completed' and value >= 10:
            should_unlock = True
        elif ach['key'] == 'task_50' and action == 'task_completed' and value >= 50:
            should_unlock = True
        elif ach['key'] == 'level_5' and user['level'] >= 5:
            should_unlock = True
        elif ach['key'] == 'level_10' and user['level'] >= 10:
            should_unlock = True
        elif ach['key'] == 'streak_3' and user['streak'] >= 3:
            should_unlock = True
        elif ach['key'] == 'streak_7' and user['streak'] >= 7:
            should_unlock = True
        elif ach['key'] == 'gold_100' and user['total_gold'] >= 100:
            should_unlock = True

        if should_unlock:
            unlocked.append(ach)

    return unlocked


def format_user_profile(user: dict) -> str:
    """Форматирование профиля пользователя"""
    title, icon = get_title_by_level(user['level'])
    xp_to_next = calculate_xp_to_next(user['total_xp'])

    return f"""
🎮 <b>LifeRPG Профиль</b>

👤 <b>{user['first_name']}</b>
⭐ Уровень: {user['level']}
📊 {icon} {title}

✨ XP: {user['xp']}/{XP_PER_LEVEL} (до след: {xp_to_next})
💰 Золото: {user['gold']}

📈 <b>Характеристики:</b>
🧠 Интеллект: {user['intellect']}
💪 Сила: {user['strength']}
🎨 Креатив: {user['creative']}
🍀 Удача: {user['luck']}

🔥 Стрик: {user['streak']} дней
✅ Задач выполнено: {user['tasks_completed']}
    """.strip()


def format_task_list(tasks: list) -> str:
    """Форматирование списка задач"""
    if not tasks:
        return "📋 У вас пока нет задач!\n\nИспользуйте /addtask чтобы создать первую задачу."

    result = "📋 <b>Ваши задачи:</b>\n\n"

    for i, task in enumerate(tasks[:10], 1):
        status = "✅" if task['status'] == 'done' else "⏳"
        category_icons = {
            'study': '📚',
            'sport': '💪',
            'creative': '🎨',
            'other': '📝'
        }
        icon = category_icons.get(task['category'], '📝')

        result += f"{i}. {status} {icon} <b>{task['title']}</b>\n"
        result += f"   Сложность: {'⭐' * task['difficulty']}\n"
        result += f"   Награда: ✨{task['xp_reward']} XP 💰{task['gold_reward']}\n\n"

    if len(tasks) > 10:
        result += f"... и ещё {len(tasks) - 10} задач\n"

    return result


def format_notes_list(notes: list) -> str:
    """Форматирование списка заметок"""
    if not notes:
        return "📝 У вас пока нет заметок!\n\nИспользуйте /addnote чтобы создать первую заметку."

    result = "📝 <b>Ваши заметки:</b>\n\n"

    for i, note in enumerate(notes[:15], 1):
        icon = "📝"
        if note['file_type'] == 'photo':
            icon = "📷"
        elif note['file_type'] == 'voice':
            icon = "🎤"
        elif note['file_type'] == 'file':
            icon = "📁"

        title = note['title'] or "Без названия"
        result += f"{i}. {icon} <b>{title[:40]}</b>\n"

        if note['tags']:
            result += f"   Теги: {note['tags']}\n"

        result += f"   {note['created_at'][:10]}\n\n"

    if len(notes) > 15:
        result += f"... и ещё {len(notes) - 15} заметок\n"

    return result
