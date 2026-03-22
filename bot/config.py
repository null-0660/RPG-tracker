# Конфигурация LifeRPG Telegram Bot
import os

# Токен бота (получить у @BotFather)
BOT_TOKEN

# База данных
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "data", "database.db")

# Администраторы (список ID)
ADMINS = []

# Настройки RPG
XP_PER_LEVEL = 100
GOLD_PER_TASK = 10

# Настройки заметок
MAX_NOTE_LENGTH = 4000
SUPPORTED_FILE_TYPES = ['txt', 'md', 'pdf', 'doc', 'docx', 'jpg', 'png', 'mp3', 'mp4']

# Логирование
LOG_LEVEL = "INFO"
LOG_FILE = "bot.log"
