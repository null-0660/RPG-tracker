"""
Обработчик профиля и статистики
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command

from database import db
from utils.rpg import format_user_profile, get_title_by_level

router = Router()


@router.message(Command("profile"))
@router.message(F.text == "🎮 Профиль")
async def cmd_profile(message: Message):
    """Профиль пользователя"""
    user = await db.get_user(message.from_user.id)

    if user:
        profile_text = format_user_profile(user)
        await message.answer(profile_text)
    else:
        await message.answer("❌ Профиль не найден. Нажмите /start")


@router.message(Command("stats"))
@router.message(F.text == "📊 Статистика")
async def cmd_stats(message: Message):
    """Статистика пользователя"""
    user = await db.get_user(message.from_user.id)

    if not user:
        await message.answer("❌ Профиль не найден. Нажмите /start")
        return

    # Получаем количество задач и заметок
    tasks = await db.get_tasks(user['user_id'])
    notes = await db.get_notes(user['user_id'])
    achievements = await db.get_achievements(user['user_id'])

    completed_tasks = sum(1 for t in tasks if t['status'] == 'done')
    unlocked_ach = sum(1 for a in achievements if a['unlocked'])

    stats_text = f"""
📊 <b>Ваша статистика</b>

🎮 <b>Общее:</b>
• Уровень: {user['level']}
• Всего XP: {user['total_xp']}
• Всего золота: {user['total_gold']}
• Звание: {get_title_by_level(user['level'])[0]}

📋 <b>Задачи:</b>
• Всего: {len(tasks)}
• Активных: {len(tasks) - completed_tasks}
• Выполнено: {completed_tasks}

📝 <b>Заметки:</b>
• Всего: {len(notes)}

🏆 <b>Достижения:</b>
• Разблокировано: {unlocked_ach}/{len(achievements)}

🔥 <b>Стрики:</b>
• Текущий: {user['streak']} дней
• Лучший: {user['best_streak']} дней

📈 <b>Характеристики:</b>
• 🧠 Интеллект: {user['intellect']}
• 💪 Сила: {user['strength']}
• 🎨 Креатив: {user['creative']}
• 🍀 Удача: {user['luck']}
"""

    await message.answer(stats_text)


@router.message(Command("achievements"))
@router.message(F.text == "🏆 Достижения")
async def cmd_achievements(message: Message):
    """Достижения"""
    user_id = message.from_user.id
    achievements = await db.get_achievements(user_id)

    if not achievements:
        await message.answer("🏆 У вас пока нет достижений. Выполняйте задачи!")
        return

    unlocked = sum(1 for a in achievements if a['unlocked'])
    total = len(achievements)

    text = f"🏆 <b>Достижения</b>\n\n"
    text += f"Разблокировано: {unlocked}/{total}\n\n"

    # Сортируем: сначала разблокированные
    sorted_ach = sorted(achievements, key=lambda x: x['unlocked'], reverse=True)

    for ach in sorted_ach:
        icon = "✅" if ach['unlocked'] else "🔒"
        progress = ach['progress'] if ach['progress'] else 0

        if ach['unlocked']:
            text += f"{icon} <b>{ach['achievement_key']}</b>\n"
        else:
            text += f"{icon} {ach['achievement_key']}: {progress}%\n"

    await message.answer(text)


@router.message(Command("inventory"))
@router.message(F.text == "🎒 Инвентарь")
async def cmd_inventory(message: Message):
    """Инвентарь"""
    user_id = message.from_user.id
    inventory = await db.get_inventory(user_id)

    if not inventory:
        await message.answer(
            "🎒 <b>Инвентарь пуст</b>\n\n"
            "Купите предметы в магазине: /shop"
        )
        return

    item_icons = {
        'health_potion': '💚',
        'mana_potion': '💙',
        'strength_potion': '💪',
        'xp_booster': '✨',
        'gold_booster': '💰'
    }

    text = "🎒 <b>Ваш инвентарь:</b>\n\n"

    for item in inventory:
        icon = item_icons.get(item['item_key'], '📦')
        name = item['item_key'].replace('_', ' ').title()
        text += f"{icon} {name}: x{item['quantity']}\n"

    text += "\n💡 Используйте предметы в бою или для бонусов!"

    await message.answer(text)
