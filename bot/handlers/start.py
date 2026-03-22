"""
Обработчик команд /start и /help
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command

from database import db
from keyboards import get_main_menu
from utils.rpg import format_user_profile

router = Router()


@router.message(Command("start"))
async def cmd_start(message: Message):
    """Обработчик команды /start"""
    user_id = message.from_user.id
    username = message.from_user.username or ""
    first_name = message.from_user.first_name
    last_name = message.from_user.last_name or ""

    # Проверяем есть ли пользователь в базе
    user = await db.get_user(user_id)

    if not user:
        # Создаем нового пользователя
        await db.create_user(user_id, username, first_name, last_name)

        # Создаем базовые достижения
        from utils.rpg import ACHIEVEMENTS
        for ach in ACHIEVEMENTS:
            await db.update_achievement_progress(user_id, ach['key'], 0)

        await message.answer(
            f"🎮 <b>Добро пожаловать в LifeRPG Bot, {first_name}!</b>\n\n"
            "Я твой персональный помощник для:\n"
            "• 📋 Управления задачами\n"
            "• 📝 Ведения заметок (текст, фото, аудио, файлы)\n"
            "• 🎮 RPG прогресса с уровнями и характеристиками\n"
            "• 🏪 Магазина с бустерами\n"
            "• 🏆 Системы достижений\n\n"
            "Нажми /help для списка команд или используй меню внизу 👇",
            reply_markup=get_main_menu()
        )
    else:
        await message.answer(
            f"👋 <b>С возвращением, {first_name}!</b>\n\n"
            "Используй меню для навигации или команды:\n"
            "/help - Список команд",
            reply_markup=get_main_menu()
        )


@router.message(Command("help"))
async def cmd_help(message: Message):
    """Обработчик команды /help"""
    help_text = """
📚 <b>Справка LifeRPG Bot</b>

🎮 <b>Основные команды:</b>
/start - Запустить бота
/help - Эта справка
/menu - Главное меню

📋 <b>Задачи:</b>
/tasks - Список задач
/addtask - Добавить задачу
/complete - Выполнить задачу

📝 <b>Заметки:</b>
/notes - Список заметок
/addnote - Текстовая заметка
/photo - Фото заметка
/voice - Голосовая заметка
/file - Файл заметка
/search - Поиск заметок

👤 <b>Профиль:</b>
/profile - Мой профиль
/stats - Статистика
/achievements - Достижения

🏪 <b>Магазин:</b>
/shop - Магазин предметов
/inventory - Инвентарь

💡 <b>Советы:</b>
• Выполняй задачи и получай XP
• XP повышает твой уровень
• Характеристики растут от задач
• Золото можно потратить в магазине
• Заметки поддерживают текст, фото, аудио и файлы
"""
    await message.answer(help_text)


@router.message(Command("menu"))
async def cmd_menu(message: Message):
    """Обработчик команды /menu"""
    await message.answer(
        "🎮 <b>Главное меню</b>\n\nВыберите раздел:",
        reply_markup=get_main_menu()
    )


@router.message(F.text == "🎮 Профиль")
async def menu_profile(message: Message):
    """Кнопка меню - Профиль"""
    user = await db.get_user(message.from_user.id)

    if user:
        profile_text = format_user_profile(user)
        await message.answer(profile_text)
    else:
        await message.answer("❌ Профиль не найден. Нажмите /start")


@router.message(F.text == "📋 Задачи")
async def menu_tasks(message: Message):
    """Кнопка меню - Задачи"""
    from keyboards import get_tasks_menu
    await message.answer(
        "📋 <b>Управление задачами</b>\n\nВыберите действие:",
        reply_markup=get_tasks_menu()
    )


@router.message(F.text == "📝 Заметки")
async def menu_notes(message: Message):
    """Кнопка меню - Заметки"""
    from keyboards import get_notes_menu
    await message.answer(
        "📝 <b>Управление заметками</b>\n\nВыберите действие:",
        reply_markup=get_notes_menu()
    )


@router.message(F.text == "🏪 Магазин")
async def menu_shop(message: Message):
    """Кнопка меню - Магазин"""
    user = await db.get_user(message.from_user.id)

    if user:
        from keyboards import get_shop_items
        shop_text = f"""
🏪 <b>Магазин</b>

💰 Ваше золото: {user['gold']}

Выберите предмет для покупки:
"""
        await message.answer(shop_text, reply_markup=get_shop_items())
    else:
        await message.answer("❌ Профиль не найден. Нажмите /start")


@router.message(F.text == "🏆 Достижения")
async def menu_achievements(message: Message):
    """Кнопка меню - Достижения"""
    user_id = message.from_user.id
    achievements = await db.get_achievements(user_id)

    if achievements:
        unlocked = sum(1 for a in achievements if a['unlocked'])
        total = len(achievements)

        text = f"🏆 <b>Достижения</b>\n\n"
        text += f"Разблокировано: {unlocked}/{total}\n\n"

        for ach in achievements:
            icon = "✅" if ach['unlocked'] else "🔒"
            progress = ach['progress'] if ach['progress'] else 0
            text += f"{icon} {ach['achievement_key']}: {progress}%\n"

        await message.answer(text)
    else:
        await message.answer("🏆 У вас пока нет достижений. Выполняйте задачи!")


@router.message(F.text == "📊 Статистика")
async def menu_stats(message: Message):
    """Кнопка меню - Статистика"""
    user = await db.get_user(message.from_user.id)

    if user:
        stats_text = f"""
📊 <b>Ваша статистика</b>

📈 <b>Общее:</b>
• Уровень: {user['level']}
• Всего XP: {user['total_xp']}
• Всего золота: {user['total_gold']}
• Задач выполнено: {user['tasks_completed']}

🔥 <b>Стрики:</b>
• Текущий: {user['streak']} дней
• Лучший: {user['best_streak']} дней

📝 <b>Заметки:</b>
"""
        notes_count = len(await db.get_notes(user['user_id']))
        stats_text += f"• Всего заметок: {notes_count}\n"

        await message.answer(stats_text)
    else:
        await message.answer("❌ Профиль не найден. Нажмите /start")


@router.message(F.text == "🔙 Назад")
async def menu_back(message: Message):
    """Кнопка меню - Назад"""
    await message.answer(
        "🔙 Возврат в главное меню",
        reply_markup=get_main_menu()
    )
