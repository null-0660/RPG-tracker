"""
Обработчик заметок
Поддержка: текст, фото, голосовые, файлы
"""

import os
from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from database import db
from keyboards import (
    get_note_categories, get_notes_list,
    get_note_actions, get_back_menu, get_notes_menu
)
from utils.rpg import format_notes_list

router = Router()


# ==================== Состояния FSM ====================

class NoteCreate(StatesGroup):
    title = State()
    content = State()
    category = State()
    tags = State()


class NoteText(StatesGroup):
    content = State()


# ==================== Команды ====================

@router.message(Command("notes"))
@router.message(F.text == "📝 Мои заметки")
async def cmd_notes(message: Message):
    """Список заметок"""
    user_id = message.from_user.id
    notes = await db.get_notes(user_id)

    if notes:
        text = format_notes_list(notes)
        keyboard = get_notes_list(notes)
        await message.answer(text, reply_markup=keyboard)
    else:
        await message.answer(
            "📝 У вас пока нет заметок!\n\n"
            "Создайте первую заметку:\n"
            "• /addnote - Текстовая\n"
            "• /photo - Фото\n"
            "• /voice - Голосовая\n"
            "• /file - Файл",
            reply_markup=get_notes_menu()
        )


@router.message(Command("addnote"))
@router.message(F.text == "➕ Текстовая заметка")
async def cmd_addnote(message: Message, state: FSMContext):
    """Создание текстовой заметки"""
    await message.answer(
        "📝 <b>Создание заметки</b>\n\n"
        "Введите заголовок (или пропустите):",
        reply_markup=get_back_menu()
    )
    await state.set_state(NoteCreate.title)


@router.message(NoteCreate.title)
async def note_title(message: Message, state: FSMContext):
    """Сохранение заголовка"""
    if message.text == "🔙 Назад":
        await state.clear()
        await message.answer("Отмена", reply_markup=get_notes_menu())
        return

    title = message.text if message.text != "пропустить" else None
    await state.update_data(title=title)

    await message.answer(
        "📝 Теперь введите содержание заметки:\n\n"
        "Поддерживаются:\n"
        "• Обычный текст\n"
        "• #теги через решетку\n"
        "• [[ссылки]] на другие заметки",
        reply_markup=get_back_menu()
    )
    await state.set_state(NoteCreate.content)


@router.message(NoteCreate.content)
async def note_content(message: Message, state: FSMContext):
    """Сохранение содержания"""
    if message.text == "🔙 Назад":
        await state.set_state(NoteCreate.title)
        await message.answer("Введите заголовок:", reply_markup=get_back_menu())
        return

    await state.update_data(content=message.text)

    # Извлекаем теги из содержания
    content = message.text
    tags = []
    for word in content.split():
        if word.startswith('#'):
            tags.append(word[1:])

    await state.update_data(tags=','.join(tags) if tags else None)

    await message.answer(
        "📊 <b>Выберите категорию:</b>",
        reply_markup=get_note_categories()
    )
    await state.set_state(NoteCreate.category)


@router.message(NoteCreate.category)
async def note_category(callback: CallbackQuery, state: FSMContext):
    """Завершение создания заметки"""
    if not callback.data:
        return

    category = callback.data.replace('note_cat_', '')
    if category == 'all':
        category = 'general'

    data = await state.get_data()

    # Создание заметки
    note_id = await db.create_note(
        user_id=callback.from_user.id,
        title=data.get('title'),
        content=data.get('content'),
        category=category,
        tags=data.get('tags')
    )

    await state.clear()

    await callback.message.edit_text(
        f"✅ <b>Заметка создана!</b>\n\n"
        f"📝 <b>{data.get('title') or 'Без названия'}</b>\n"
        f"📁 Категория: {category}\n"
        f"🏷️ Теги: {data.get('tags') or 'Нет'}\n\n"
        f"ID: {note_id}"
    )

    await callback.message.answer(
        "📝 Что дальше?",
        reply_markup=get_notes_menu()
    )


# ==================== Фото заметки ====================

@router.message(Command("photo"))
@router.message(F.text == "📷 Фото заметка")
async def cmd_photo(message: Message, state: FSMContext):
    """Создание фото заметки"""
    await message.answer(
        "📷 <b>Фото заметка</b>\n\n"
        "Отправьте фотографию с подписью (или без):"
    )
    await state.set_state('note_photo')


@router.message(F.photo, NoteCreate.content)
@router.message(F.photo)
async def photo_received(message: Message, state: FSMContext):
    """Получено фото"""
    # Получаем фото лучшего качества
    photo = message.photo[-1]
    file_id = photo.file_id

    # Получаем подпись
    caption = message.caption or ""

    # Извлекаем теги
    tags = []
    for word in caption.split():
        if word.startswith('#'):
            tags.append(word[1:])

    # Создаем заметку
    note_id = await db.create_note(
        user_id=message.from_user.id,
        title=caption.split('\n')[0][:50] if caption else "Фото",
        content=caption,
        category='general',
        tags=','.join(tags) if tags else None,
        file_id=file_id,
        file_type='photo'
    )

    await message.answer(
        f"✅ <b>Фото заметка создана!</b>\n\n"
        f"ID: {note_id}"
    )


# ==================== Голосовые заметки ====================

@router.message(Command("voice"))
@router.message(F.text == "🎤 Голосовая")
async def cmd_voice(message: Message, state: FSMContext):
    """Создание голосовой заметки"""
    await message.answer(
        "🎤 <b>Голосовая заметка</b>\n\n"
        "Отправьте голосовое сообщение:"
    )
    await state.set_state('note_voice')


@router.message(F.voice)
async def voice_received(message: Message, state: FSMContext):
    """Получено голосовое"""
    voice = message.voice
    file_id = voice.file_id
    duration = voice.duration

    note_id = await db.create_note(
        user_id=message.from_user.id,
        title=f"Голосовая {datetime.now().strftime('%d.%m %H:%M')}",
        content=f"Длительность: {duration} сек",
        category='general',
        file_id=file_id,
        file_type='voice'
    )

    await message.answer(
        f"✅ <b>Голосовая заметка создана!</b>\n\n"
        f"⏱️ Длительность: {duration} сек\n"
        f"ID: {note_id}"
    )


# ==================== Файл заметки ====================

@router.message(Command("file"))
@router.message(F.text == "📁 Файл")
async def cmd_file(message: Message, state: FSMContext):
    """Создание файл заметки"""
    await message.answer(
        "📁 <b>Файл заметка</b>\n\n"
        "Отправьте файл (документ):"
    )
    await state.set_state('note_file')


@router.message(F.document)
async def file_received(message: Message, state: FSMContext):
    """Получен файл"""
    document = message.document
    file_id = document.file_id
    file_name = document.file_name

    # Получаем подпись
    caption = message.caption or ""

    note_id = await db.create_note(
        user_id=message.from_user.id,
        title=file_name[:50],
        content=caption,
        category='general',
        file_id=file_id,
        file_type='file'
    )

    await message.answer(
        f"✅ <b>Файл заметка создана!</b>\n\n"
        f"📄 Файл: {file_name}\n"
        f"ID: {note_id}"
    )


# ==================== Поиск ====================

@router.message(Command("search"))
@router.message(F.text == "🔍 Поиск")
async def cmd_search(message: Message):
    """Поиск по заметкам"""
    await message.answer(
        "🔍 <b>Поиск по заметкам</b>\n\n"
        "Введите поисковый запрос:"
    )


@router.message()
async def search_query(message: Message):
    """Обработка поискового запроса"""
    # Проверяем, не команда ли это
    if message.text.startswith('/'):
        return

    user_id = message.from_user.id
    query = message.text

    notes = await db.search_notes(user_id, query)

    if notes:
        text = f"🔍 <b>Результаты поиска:</b>\n\n"
        text += format_notes_list(notes)
        keyboard = get_notes_list(notes)
        await message.answer(text, reply_markup=keyboard)
    else:
        await message.answer(f"❌ Ничего не найдено по запросу \"{query}\"")


# ==================== Просмотр заметки ====================

@router.callback_query(F.data.startswith("note_view_"))
async def view_note(callback: CallbackQuery):
    """Просмотр заметки"""
    note_id = int(callback.data.replace('note_view_', ''))
    note = await db.get_note(note_id)

    if note:
        text = f"📝 <b>{note['title'] or 'Без названия'}</b>\n\n"

        # Если есть файл
        if note['file_type'] == 'photo':
            text += note['content'] or ""
            await callback.message.answer_photo(
                photo=note['file_id'],
                caption=text,
                reply_markup=get_note_actions(note_id)
            )
        elif note['file_type'] == 'voice':
            text += note['content'] or ""
            await callback.message.answer_voice(
                voice=note['file_id'],
                caption=text,
                reply_markup=get_note_actions(note_id)
            )
        elif note['file_type'] == 'file':
            text += note['content'] or ""
            await callback.message.answer_document(
                document=note['file_id'],
                caption=text,
                reply_markup=get_note_actions(note_id)
            )
        else:
            # Текстовая заметка
            content = note['content'] or "Пусто"

            # Форматируем ссылки [[название]]
            import re
            content = re.sub(r'\[\[(.*?)\]\]', r'📎 \1', content)

            text += f"{content}\n\n"

            if note['tags']:
                text += f"🏷️ Теги: {note['tags']}\n"

            text += f"📁 Категория: {note['category']}\n"
            text += f"📅 Создана: {note['created_at'][:10]}"

            await callback.message.edit_text(text, reply_markup=get_note_actions(note_id))


@router.callback_query(F.data.startswith("note_delete_"))
async def delete_note(callback: CallbackQuery):
    """Удаление заметки"""
    note_id = int(callback.data.replace('note_delete_', ''))
    await db.delete_note(note_id)

    await callback.message.edit_text("🗑 Заметка удалена!")


@router.callback_query(F.data == "notes_back")
async def notes_back(callback: CallbackQuery):
    """Назад к заметкам"""
    await callback.message.edit_text(
        "📝 <b>Управление заметками</b>",
        reply_markup=get_notes_menu()
    )
