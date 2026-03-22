"""
Обработчик магазина
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command

from database import db
from keyboards import get_shop_items, get_inventory_items, get_main_menu
from utils.rpg import SHOP_ITEMS

router = Router()


@router.message(Command("shop"))
@router.message(F.text == "🏪 Магазин")
async def cmd_shop(message: Message):
    """Магазин"""
    user = await db.get_user(message.from_user.id)

    if not user:
        await message.answer("❌ Профиль не найден. Нажмите /start")
        return

    shop_text = f"""
🏪 <b>Магазин</b>

💰 Ваше золото: {user['gold']}

📦 <b>Предметы:</b>
"""

    for key, item in SHOP_ITEMS.items():
        shop_text += f"\n{item['icon']} <b>{item['name']}</b> - {item['price']}💰"
        shop_text += f"\n   {item['description']}"

    shop_text += "\n\nВыберите предмет для покупки:"

    await message.answer(shop_text, reply_markup=get_shop_items())


@router.callback_query(F.data.startswith("buy_"))
async def buy_item(callback: CallbackQuery):
    """Покупка предмета"""
    user_id = callback.from_user.id
    user = await db.get_user(user_id)

    if not user:
        await callback.answer("❌ Профиль не найден", show_alert=True)
        return

    item_key = callback.data.replace('buy_', '')
    item = SHOP_ITEMS.get(item_key)

    if not item:
        await callback.answer("❌ Предмет не найден", show_alert=True)
        return

    # Проверка золота
    if user['gold'] < item['price']:
        await callback.answer(
            f"❌ Недостаточно золота!\nНужно: {item['price']}💰\nУ вас: {user['gold']}💰",
            show_alert=True
        )
        return

    # Покупка
    await db.add_gold(user_id, -item['price'])
    await db.add_item(user_id, item_key, 1)

    await callback.answer(
        f"✅ Куплено: {item['name']}!\n"
        f"💰 -{item['price']}",
        show_alert=True
    )

    # Обновляем сообщение
    new_user = await db.get_user(user_id)
    await callback.message.edit_text(
        f"✅ <b>Покупка успешна!</b>\n\n"
        f"{item['icon']} {item['name']}\n"
        f"💰 Остаток: {new_user['gold']}",
        reply_markup=get_shop_items()
    )


@router.callback_query(F.data.startswith("use_"))
async def use_item(callback: CallbackQuery):
    """Использование предмета"""
    user_id = callback.from_user.id
    item_key = callback.data.replace('use_', '')

    # Проверка наличия
    item = await db.get_item(user_id, item_key)
    if not item or item['quantity'] <= 0:
        await callback.answer("❌ Нет этого предмета!", show_alert=True)
        return

    # Используем предмет
    item_info = SHOP_ITEMS.get(item_key)

    if item_key in ['xp_booster', 'gold_booster', 'mana_potion', 'strength_potion']:
        # Активируем бустер (в реальной реализации нужно хранить время активации)
        await db.remove_item(user_id, item_key, 1)

        await callback.answer(
            f"✅ {item_info['name']} активирован!\n"
            f"Действует 1 час",
            show_alert=True
        )
    elif item_key == 'health_potion':
        await callback.answer(
            f"💚 {item_info['name']} используется в бою",
            show_alert=True
        )
    else:
        await callback.answer("❌ Этот предмет нельзя использовать", show_alert=True)


@router.callback_query(F.data == "shop_back")
async def shop_back(callback: CallbackQuery):
    """Назад из магазина"""
    await callback.message.edit_text(
        "🏪 <b>Магазин закрыт</b>\n\nЗаходите ещё!",
        reply_markup=get_main_menu()
    )


@router.callback_query(F.data == "inventory_back")
async def inventory_back(callback: CallbackQuery):
    """Назад из инвентаря"""
    await callback.message.edit_text(
        "🎒 <b>Инвентарь</b>",
        reply_markup=get_main_menu()
    )
