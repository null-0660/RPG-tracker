"""
Обработчик задач
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from database import db
from keyboards import (
    get_task_categories, get_task_difficulty,
    get_task_actions, get_tasks_list, get_tasks_menu,
    get_main_menu, get_back_menu
)
from utils.rpg import format_task_list, calculate_xp_reward, calculate_gold_reward, get_stat_by_category

router = Router()


# ==================== Состояния FSM ====================

class TaskCreate(StatesGroup):
    title = State()
    description = State()
    category = State()
    difficulty = State()


# ==================== Команды ====================

@router.message(Command("tasks"))
async def cmd_tasks(message: Message):
    """Список задач"""
    user_id = message.from_user.id
    tasks = await db.get_tasks(user_id, 'active')

    if tasks:
        text = format_task_list(tasks)
        keyboard = get_tasks_list(tasks)
        await message.answer(text, reply_markup=keyboard)
    else:
        await message.answer(
            "📋 У вас пока нет активных задач!\n\n"
            "Нажмите ➕ Добавить задачу или используйте /addtask",
            reply_markup=get_tasks_menu()
        )


@router.message(Command("addtask"))
@router.message(F.text == "➕ Добавить задачу")
async def cmd_addtask(message: Message, state: FSMContext):
    """Начало создания задачи"""
    await message.answer(
        "📝 <b>Создание задачи</b>\n\n"
        "Введите название задачи:",
        reply_markup=get_back_menu()
    )
    await state.set_state(TaskCreate.title)


@router.message(TaskCreate.title)
async def task_title(message: Message, state: FSMContext):
    """Сохранение названия"""
    if message.text == "🔙 Назад":
        await state.clear()
        await message.answer("Отмена создания задачи", reply_markup=get_tasks_menu())
        return

    await state.update_data(title=message.text)
    await message.answer(
        "📝 Отлично! Теперь введите описание задачи (или пропустите):",
        reply_markup=get_back_menu()
    )
    await state.set_state(TaskCreate.description)


@router.message(TaskCreate.description)
async def task_description(message: Message, state: FSMContext):
    """Сохранение описания"""
    if message.text == "🔙 Назад":
        await state.set_state(TaskCreate.title)
        await message.answer("Введите название задачи:", reply_markup=get_back_menu())
        return

    await state.update_data(description=message.text if message.text != "пропустить" else None)
    await message.answer(
        "📊 <b>Выберите категорию задачи:</b>",
        reply_markup=get_task_categories()
    )
    await state.set_state(TaskCreate.category)


@router.message(TaskCreate.category)
async def task_category(message: CallbackQuery, state: FSMContext):
    """Сохранение категории"""
    if not message.data:
        return

    category = message.data.replace('cat_', '')
    await state.update_data(category=category)

    await message.message.edit_text(
        "⭐ <b>Выберите сложность:</b>\n\n"
        "1 - Легко (10 XP)\n"
        "2 - Средне (20 XP)\n"
        "3 - Сложно (30 XP)\n"
        "4 - Очень сложно (50 XP)\n"
        "5 - Экстрим (100 XP)",
        reply_markup=get_task_difficulty()
    )
    await state.set_state(TaskCreate.difficulty)


@router.message(TaskCreate.difficulty)
async def task_difficulty(message: CallbackQuery, state: FSMContext):
    """Завершение создания задачи"""
    if not message.data:
        return

    difficulty = int(message.data.replace('diff_', ''))
    data = await state.get_data()

    # Расчет награды
    xp_reward = 10 * difficulty
    gold_reward = 5 * difficulty

    # Создание задачи
    task_id = await db.create_task(
        user_id=message.from_user.id,
        title=data['title'],
        description=data.get('description'),
        category=data['category'],
        difficulty=difficulty,
        xp_reward=xp_reward,
        gold_reward=gold_reward
    )

    await state.clear()

    category_icons = {
        'study': '📚',
        'sport': '💪',
        'creative': '🎨',
        'other': '📝'
    }
    icon = category_icons.get(data['category'], '📝')

    await message.message.edit_text(
        f"✅ <b>Задача создана!</b>\n\n"
        f"{icon} <b>{data['title']}</b>\n"
        f"Сложность: {'⭐' * difficulty}\n"
        f"Награда: ✨{xp_reward} XP 💰{gold_reward}\n\n"
        f"ID задачи: {task_id}"
    )

    await message.message.answer(
        "📋 Что дальше?",
        reply_markup=get_tasks_menu()
    )


@router.message(F.text == "📋 Список задач")
async def menu_tasks_list(message: Message):
    """Меню - список задач"""
    user_id = message.from_user.id
    tasks = await db.get_tasks(user_id, 'active')

    if tasks:
        text = format_task_list(tasks)
        keyboard = get_tasks_list(tasks)
        await message.answer(text, reply_markup=keyboard)
    else:
        await message.answer("📋 У вас нет активных задач!")


@router.message(F.text == "✅ Выполненные")
async def menu_completed_tasks(message: Message):
    """Меню - выполненные задачи"""
    user_id = message.from_user.id
    tasks = await db.get_tasks(user_id, 'done')

    if tasks:
        text = "✅ <b>Выполненные задачи:</b>\n\n"
        for task in tasks[:10]:
            text += f"• {task['title']} (+{task['xp_reward']} XP)\n"
        await message.answer(text)
    else:
        await message.answer("✅ Пока нет выполненных задач!")


@router.callback_query(F.data.startswith("task_view_"))
async def view_task(callback: CallbackQuery):
    """Просмотр задачи"""
    task_id = int(callback.data.replace('task_view_', ''))
    task = await db.get_task(task_id)

    if task:
        category_icons = {
            'study': '📚',
            'sport': '💪',
            'creative': '🎨',
            'other': '📝'
        }
        icon = category_icons.get(task['category'], '📝')

        text = f"""
{icon} <b>{task['title']}</b>

📝 Описание: {task['description'] or 'Нет описания'}

⭐ Сложность: {'⭐' * task['difficulty']}
✨ Награда: {task['xp_reward']} XP
💰 Золото: {task['gold_reward']}

📅 Создана: {task['created_at'][:10]}
"""
        keyboard = get_task_actions(task_id) if task['status'] == 'active' else get_back_menu()
        await callback.message.edit_text(text, reply_markup=keyboard)


@router.callback_query(F.data.startswith("task_complete_"))
async def complete_task(callback: CallbackQuery):
    """Выполнение задачи"""
    task_id = int(callback.data.replace('task_complete_', ''))
    task = await db.get_task(task_id)

    if task and task['status'] == 'active':
        # Обновляем задачу
        await db.complete_task(task_id)

        # Награды
        user = await db.get_user(callback.from_user.id)
        stat_type = get_stat_by_category(task['category'])

        await db.add_xp(callback.from_user.id, task['xp_reward'])
        await db.add_gold(callback.from_user.id, task['gold_reward'])

        # Обновляем статистику пользователя
        new_completed = user['tasks_completed'] + 1
        await db.update_user(callback.from_user.id, tasks_completed=new_completed)

        # Прирост характеристики
        stat_gain = max(1, task['xp_reward'] // 20)
        current_stat = user.get(stat_type, 0)
        await db.update_user(callback.from_user.id, **{stat_type: current_stat + stat_gain})

        # Проверяем достижения
        from utils.rpg import check_achievements
        unlocked = check_achievements(user, 'task_completed', new_completed)

        text = f"""
✅ <b>Задача выполнена!</b>

✨ +{task['xp_reward']} XP
💰 +{task['gold_reward']} Золота
{get_stat_icon(stat_type)} +{stat_gain} {get_stat_name(stat_type)}
"""
        if unlocked:
            text += f"\n🏆 <b>Новые достижения:</b>\n"
            for ach in unlocked:
                text += f"• {ach['name']} {ach['icon']}\n"

        await callback.message.edit_text(text)

        # Обновляем профиль в базе
        await db.update_achievement_progress(callback.from_user.id, 'first_task', new_completed)
        await db.update_achievement_progress(callback.from_user.id, 'task_10', new_completed)
        await db.update_achievement_progress(callback.from_user.id, 'task_50', new_completed)


@router.callback_query(F.data.startswith("task_delete_"))
async def delete_task(callback: CallbackQuery):
    """Удаление задачи"""
    task_id = int(callback.data.replace('task_delete_', ''))
    await db.delete_task(task_id)

    await callback.message.edit_text("🗑 Задача удалена!")

    # Возвращаем список задач
    user_id = callback.from_user.id
    tasks = await db.get_tasks(user_id, 'active')
    if tasks:
        await callback.message.answer(
            format_task_list(tasks),
            reply_markup=get_tasks_list(tasks)
        )


@router.callback_query(F.data == "tasks_back")
async def tasks_back(callback: CallbackQuery):
    """Назад к задачам"""
    await callback.message.edit_text(
        "📋 <b>Управление задачами</b>",
        reply_markup=get_tasks_menu()
    )


# ==================== Утилиты ====================

def get_stat_icon(stat_type: str) -> str:
    """Иконка характеристики"""
    icons = {
        'intellect': '🧠',
        'strength': '💪',
        'creative': '🎨',
        'luck': '🍀'
    }
    return icons.get(stat_type, '📊')


def get_stat_name(stat_type: str) -> str:
    """Название характеристики"""
    names = {
        'intellect': 'Интеллект',
        'strength': 'Сила',
        'creative': 'Креатив',
        'luck': 'Удача'
    }
    return names.get(stat_type, 'Характеристика')
