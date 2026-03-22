"""
Клавиатуры для LifeRPG Telegram Bot
"""

from aiogram.types import (
    InlineKeyboardMarkup, InlineKeyboardButton,
    KeyboardButton, ReplyKeyboardMarkup
)
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder


# ==================== Reply Клавиатуры (основное меню) ====================

def get_main_menu() -> ReplyKeyboardMarkup:
    """Главное меню"""
    builder = ReplyKeyboardBuilder()
    builder.row(KeyboardButton(text="🎮 Профиль"), KeyboardButton(text="📋 Задачи"))
    builder.row(KeyboardButton(text="📝 Заметки"), KeyboardButton(text="🏪 Магазин"))
    builder.row(KeyboardButton(text="🏆 Достижения"), KeyboardButton(text="📊 Статистика"))
    builder.adjust(2, 2, 2)
    return builder.as_markup(resize_keyboard=True)


def get_notes_menu() -> ReplyKeyboardMarkup:
    """Меню заметок"""
    builder = ReplyKeyboardBuilder()
    builder.row(KeyboardButton(text="📝 Мои заметки"))
    builder.row(KeyboardButton(text="➕ Текстовая заметка"), KeyboardButton(text="📷 Фото заметка"))
    builder.row(KeyboardButton(text="🎤 Голосовая"), KeyboardButton(text="📁 Файл"))
    builder.row(KeyboardButton(text="🔍 Поиск"), KeyboardButton(text="🔙 Назад"))
    builder.adjust(1, 2, 2, 2)
    return builder.as_markup(resize_keyboard=True)


def get_tasks_menu() -> ReplyKeyboardMarkup:
    """Меню задач"""
    builder = ReplyKeyboardBuilder()
    builder.row(KeyboardButton(text="📋 Список задач"))
    builder.row(KeyboardButton(text="➕ Добавить задачу"))
    builder.row(KeyboardButton(text="✅ Выполненные"), KeyboardButton(text="🗑 Удалить"))
    builder.row(KeyboardButton(text="🔙 Назад"))
    builder.adjust(1, 2, 2, 1)
    return builder.as_markup(resize_keyboard=True)


def get_back_menu() -> ReplyKeyboardMarkup:
    """Меню с кнопкой назад"""
    builder = ReplyKeyboardBuilder()
    builder.row(KeyboardButton(text="🔙 Назад"))
    return builder.as_markup(resize_keyboard=True)


# ==================== Inline Клавиатуры ====================

def get_task_categories() -> InlineKeyboardMarkup:
    """Выбор категории задачи"""
    builder = InlineKeyboardBuilder()
    builder.button(text="📚 Учёба", callback_data="cat_study")
    builder.button(text="💪 Спорт", callback_data="cat_sport")
    builder.button(text="🎨 Творчество", callback_data="cat_creative")
    builder.button(text="📝 Другое", callback_data="cat_other")
    builder.adjust(2, 2)
    return builder.as_markup()


def get_task_difficulty() -> InlineKeyboardMarkup:
    """Выбор сложности задачи"""
    builder = InlineKeyboardBuilder()
    builder.button(text="1 - Легко", callback_data="diff_1")
    builder.button(text="2 - Средне", callback_data="diff_2")
    builder.button(text="3 - Сложно", callback_data="diff_3")
    builder.button(text="4 - Очень сложно", callback_data="diff_4")
    builder.button(text="5 - Экстрим", callback_data="diff_5")
    builder.adjust(2, 2, 1)
    return builder.as_markup()


def get_task_actions(task_id: int) -> InlineKeyboardMarkup:
    """Действия с задачей"""
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Выполнить", callback_data=f"task_complete_{task_id}")
    builder.button(text="✏️ Редактировать", callback_data=f"task_edit_{task_id}")
    builder.button(text="🗑 Удалить", callback_data=f"task_delete_{task_id}")
    builder.adjust(2, 1)
    return builder.as_markup()


def get_tasks_list(tasks: list) -> InlineKeyboardMarkup:
    """Список задач"""
    builder = InlineKeyboardBuilder()
    for task in tasks[:10]:  # Максимум 10 задач
        status = "✅" if task['status'] == 'done' else "⏳"
        builder.button(
            text=f"{status} {task['title'][:30]}",
            callback_data=f"task_view_{task['task_id']}"
        )
    builder.button(text="🔙 Назад", callback_data="tasks_back")
    builder.adjust(1)
    return builder.as_markup()


def get_note_categories() -> InlineKeyboardMarkup:
    """Категории заметок"""
    builder = InlineKeyboardBuilder()
    builder.button(text="📝 Общие", callback_data="note_cat_general")
    builder.button(text="💡 Идеи", callback_data="note_cat_ideas")
    builder.button(text="📚 Учеба", callback_data="note_cat_study")
    builder.button(text="🎯 Цели", callback_data="note_cat_goals")
    builder.button(text="📓 Дневник", callback_data="note_cat_diary")
    builder.button(text="📁 Все заметки", callback_data="note_cat_all")
    builder.adjust(2, 2, 2)
    return builder.as_markup()


def get_note_actions(note_id: int) -> InlineKeyboardMarkup:
    """Действия с заметкой"""
    builder = InlineKeyboardBuilder()
    builder.button(text="✏️ Редактировать", callback_data=f"note_edit_{note_id}")
    builder.button(text="🗑 Удалить", callback_data=f"note_delete_{note_id}")
    builder.button(text="📤 Экспорт", callback_data=f"note_export_{note_id}")
    builder.adjust(2, 1)
    return builder.as_markup()


def get_notes_list(notes: list) -> InlineKeyboardMarkup:
    """Список заметок"""
    builder = InlineKeyboardBuilder()
    for note in notes[:15]:  # Максимум 15 заметок
        icon = "📝"
        if note['file_type'] == 'photo':
            icon = "📷"
        elif note['file_type'] == 'voice':
            icon = "🎤"
        elif note['file_type'] == 'file':
            icon = "📁"
        title = note['title'] or "Без названия"
        builder.button(
            text=f"{icon} {title[:35]}",
            callback_data=f"note_view_{note['note_id']}"
        )
    builder.button(text="🔙 Назад", callback_data="notes_back")
    builder.adjust(1)
    return builder.as_markup()


def get_shop_items() -> InlineKeyboardMarkup:
    """Магазин предметов"""
    builder = InlineKeyboardBuilder()
    items = [
        ("💚 Зелье лечения", "buy_health_potion", 20),
        ("💙 Зелье маны", "buy_mana_potion", 30),
        ("💪 Зелье силы", "buy_strength_potion", 25),
        ("✨ Бустер XP", "buy_xp_booster", 50),
        ("💰 Бустер золота", "buy_gold_booster", 40),
    ]
    for name, callback, price in items:
        builder.button(text=f"{name} - {price}💰", callback_data=callback)
    builder.button(text="🔙 Назад", callback_data="shop_back")
    builder.adjust(1)
    return builder.as_markup()


def get_inventory_items(items: list) -> InlineKeyboardMarkup:
    """Инвентарь"""
    builder = InlineKeyboardBuilder()
    item_icons = {
        'health_potion': '💚',
        'mana_potion': '💙',
        'strength_potion': '💪',
        'xp_booster': '✨',
        'gold_booster': '💰',
    }
    for item in items:
        icon = item_icons.get(item['item_key'], '📦')
        builder.button(
            text=f"{icon} {item['item_key']} x{item['quantity']}",
            callback_data=f"use_{item['item_key']}"
        )
    builder.button(text="🔙 Назад", callback_data="inventory_back")
    builder.adjust(1)
    return builder.as_markup()


def get_achievements_list(achievements: list) -> InlineKeyboardMarkup:
    """Список достижений"""
    builder = InlineKeyboardBuilder()
    for ach in achievements[:20]:
        icon = "🔒" if not ach['unlocked'] else "✅"
        builder.button(
            text=f"{icon} {ach['achievement_key']}",
            callback_data=f"ach_view_{ach['achievement_key']}"
        )
    builder.button(text="🔙 Назад", callback_data="achievements_back")
    builder.adjust(1)
    return builder.as_markup()


def get_confirm_keyboard(yes_callback: str, no_callback: str) -> InlineKeyboardMarkup:
    """Подтверждение действия"""
    builder = InlineKeyboardBuilder()
    builder.button(text="✅ Да", callback_data=yes_callback)
    builder.button(text="❌ Нет", callback_data=no_callback)
    builder.adjust(2)
    return builder.as_markup()


def get_pagination_keyboard(current_page: int, total_pages: int, callback_prefix: str) -> InlineKeyboardMarkup:
    """Пагинация"""
    builder = InlineKeyboardBuilder()
    if current_page > 0:
        builder.button(text="⬅️", callback_data=f"{callback_prefix}_page_{current_page - 1}")
    builder.button(text=f"{current_page + 1}/{total_pages}", callback_data="ignore")
    if current_page < total_pages - 1:
        builder.button(text="➡️", callback_data=f"{callback_prefix}_page_{current_page + 1}")
    builder.adjust(3)
    return builder.as_markup()
