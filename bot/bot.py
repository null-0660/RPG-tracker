"""
LifeRPG Telegram Bot
Главный файл запуска
"""

import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import BOT_TOKEN, LOG_LEVEL
from database import init_db, close_db

# Импорты обработчиков
from handlers import start, tasks, notes, profile, shop

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='bot.log'
)

logger = logging.getLogger(__name__)


async def main():
    """Основная функция"""
    # Инициализация базы данных
    await init_db()
    logger.info("База данных подключена")

    # Инициализация бота
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()

    # Регистрация роутеров (обработчиков)
    dp.include_router(start.router)
    dp.include_router(tasks.router)
    dp.include_router(notes.router)
    dp.include_router(profile.router)
    dp.include_router(shop.router)

    # Запуск polling
    logger.info("Бот запущен...")
    await dp.start_polling(bot)


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот остановлен")
    finally:
        asyncio.run(close_db())
