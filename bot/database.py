"""
База данных для LifeRPG Telegram Bot
SQLite с асинхронной поддержкой
"""

import aiosqlite
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from config import DATABASE_PATH


class Database:
    def __init__(self, db_path: str = DATABASE_PATH):
        self.db_path = db_path
        self.db: Optional[aiosqlite.Connection] = None

    async def connect(self):
        """Подключение к базе данных"""
        self.db = await aiosqlite.connect(self.db_path)
        self.db.row_factory = aiosqlite.Row
        await self.create_tables()

    async def close(self):
        """Закрытие подключения"""
        if self.db:
            await self.db.close()

    async def create_tables(self):
        """Создание таблиц"""
        await self.db.executescript('''
            -- Пользователи
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                level INTEGER DEFAULT 1,
                xp INTEGER DEFAULT 0,
                total_xp INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 0,
                total_gold INTEGER DEFAULT 0,
                streak INTEGER DEFAULT 0,
                best_streak INTEGER DEFAULT 0,
                tasks_completed INTEGER DEFAULT 0,
                intellect INTEGER DEFAULT 0,
                strength INTEGER DEFAULT 0,
                creative INTEGER DEFAULT 0,
                luck INTEGER DEFAULT 0,
                avatar TEXT DEFAULT '🧙‍♂️',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Задачи
            CREATE TABLE IF NOT EXISTS tasks (
                task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'other',
                difficulty INTEGER DEFAULT 1,
                xp_reward INTEGER DEFAULT 10,
                gold_reward INTEGER DEFAULT 5,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );

            -- Заметки
            CREATE TABLE IF NOT EXISTS notes (
                note_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT,
                content TEXT,
                category TEXT DEFAULT 'general',
                tags TEXT,
                file_id TEXT,
                file_type TEXT,
                file_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );

            -- Достижения
            CREATE TABLE IF NOT EXISTS achievements (
                achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                achievement_key TEXT NOT NULL,
                unlocked INTEGER DEFAULT 0,
                progress INTEGER DEFAULT 0,
                unlocked_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                UNIQUE(user_id, achievement_key)
            );

            -- Инвентарь
            CREATE TABLE IF NOT EXISTS inventory (
                inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                item_key TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                UNIQUE(user_id, item_key)
            );

            -- Индексы для ускорения поиска
            CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
            CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
            CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
            CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
        ''')
        await self.db.commit()

    # ==================== Пользователи ====================

    async def get_user(self, user_id: int) -> Optional[Dict]:
        """Получить пользователя"""
        async with self.db.execute(
            'SELECT * FROM users WHERE user_id = ?', (user_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def create_user(self, user_id: int, username: str, first_name: str, last_name: str = None):
        """Создать нового пользователя"""
        await self.db.execute('''
            INSERT OR IGNORE INTO users (user_id, username, first_name, last_name)
            VALUES (?, ?, ?, ?)
        ''', (user_id, username, first_name, last_name))
        await self.db.commit()

    async def update_user(self, user_id: int, **kwargs):
        """Обновить данные пользователя"""
        fields = ', '.join(f'{k} = ?' for k in kwargs.keys())
        values = list(kwargs.values()) + [user_id]
        await self.db.execute(
            f'UPDATE users SET {fields} WHERE user_id = ?', values
        )
        await self.db.commit()

    async def add_xp(self, user_id: int, xp: int):
        """Добавить опыт пользователю"""
        user = await self.get_user(user_id)
        if not user:
            return

        new_xp = user['xp'] + xp
        new_total_xp = user['total_xp'] + xp
        new_level = (new_total_xp // 100) + 1

        await self.update_user(
            user_id,
            xp=new_xp,
            total_xp=new_total_xp,
            level=new_level
        )

        return new_level > user['level']  # Повышение уровня

    async def add_gold(self, user_id: int, gold: int):
        """Добавить золото пользователю"""
        user = await self.get_user(user_id)
        if not user:
            return

        await self.update_user(
            user_id,
            gold=user['gold'] + gold,
            total_gold=user['total_gold'] + gold
        )

    # ==================== Задачи ====================

    async def create_task(self, user_id: int, title: str, description: str = None,
                          category: str = 'other', difficulty: int = 1,
                          xp_reward: int = 10, gold_reward: int = 5) -> int:
        """Создать задачу"""
        cursor = await self.db.execute('''
            INSERT INTO tasks (user_id, title, description, category, difficulty, xp_reward, gold_reward)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, title, description, category, difficulty, xp_reward, gold_reward))
        await self.db.commit()
        return cursor.lastrowid

    async def get_tasks(self, user_id: int, status: str = 'active') -> List[Dict]:
        """Получить задачи пользователя"""
        async with self.db.execute(
            'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
            (user_id, status)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_task(self, task_id: int) -> Optional[Dict]:
        """Получить задачу по ID"""
        async with self.db.execute(
            'SELECT * FROM tasks WHERE task_id = ?', (task_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def complete_task(self, task_id: int):
        """Отметить задачу выполненной"""
        await self.db.execute('''
            UPDATE tasks SET status = 'done', completed_at = CURRENT_TIMESTAMP
            WHERE task_id = ?
        ''', (task_id,))
        await self.db.commit()

    async def delete_task(self, task_id: int):
        """Удалить задачу"""
        await self.db.execute('DELETE FROM tasks WHERE task_id = ?', (task_id,))
        await self.db.commit()

    # ==================== Заметки ====================

    async def create_note(self, user_id: int, title: str = None, content: str = None,
                          category: str = 'general', tags: str = None,
                          file_id: str = None, file_type: str = None,
                          file_path: str = None) -> int:
        """Создать заметку"""
        cursor = await self.db.execute('''
            INSERT INTO notes (user_id, title, content, category, tags, file_id, file_type, file_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, title, content, category, tags, file_id, file_type, file_path))
        await self.db.commit()
        return cursor.lastrowid

    async def get_notes(self, user_id: int, category: str = None) -> List[Dict]:
        """Получить заметки пользователя"""
        if category:
            async with self.db.execute('''
                SELECT * FROM notes WHERE user_id = ? AND category = ?
                ORDER BY updated_at DESC
            ''', (user_id, category)) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
        else:
            async with self.db.execute('''
                SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC
            ''', (user_id,)) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

    async def get_note(self, note_id: int) -> Optional[Dict]:
        """Получить заметку по ID"""
        async with self.db.execute(
            'SELECT * FROM notes WHERE note_id = ?', (note_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

    async def search_notes(self, user_id: int, query: str) -> List[Dict]:
        """Поиск по заметкам"""
        async with self.db.execute('''
            SELECT * FROM notes WHERE user_id = ?
            AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)
            ORDER BY updated_at DESC
        ''', (user_id, f'%{query}%', f'%{query}%', f'%{query}%')) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def update_note(self, note_id: int, **kwargs):
        """Обновить заметку"""
        kwargs['updated_at'] = datetime.now().isoformat()
        fields = ', '.join(f'{k} = ?' for k in kwargs.keys())
        values = list(kwargs.values()) + [note_id]
        await self.db.execute(f'UPDATE notes SET {fields} WHERE note_id = ?', values)
        await self.db.commit()

    async def delete_note(self, note_id: int):
        """Удалить заметку"""
        await self.db.execute('DELETE FROM notes WHERE note_id = ?', (note_id,))
        await self.db.commit()

    # ==================== Достижения ====================

    async def get_achievements(self, user_id: int) -> List[Dict]:
        """Получить достижения пользователя"""
        async with self.db.execute(
            'SELECT * FROM achievements WHERE user_id = ?', (user_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def unlock_achievement(self, user_id: int, achievement_key: str):
        """Разблокировать достижение"""
        await self.db.execute('''
            INSERT OR REPLACE INTO achievements (user_id, achievement_key, unlocked, progress, unlocked_at)
            VALUES (?, ?, 1, 100, CURRENT_TIMESTAMP)
        ''', (user_id, achievement_key))
        await self.db.commit()

    async def update_achievement_progress(self, user_id: int, achievement_key: str, progress: int):
        """Обновить прогресс достижения"""
        await self.db.execute('''
            INSERT OR IGNORE INTO achievements (user_id, achievement_key, unlocked, progress)
            VALUES (?, ?, 0, 0)
        ''', (user_id, achievement_key))

        await self.db.execute('''
            UPDATE achievements SET progress = ?
            WHERE user_id = ? AND achievement_key = ?
        ''', (progress, user_id, achievement_key))
        await self.db.commit()

    # ==================== Инвентарь ====================

    async def get_inventory(self, user_id: int) -> List[Dict]:
        """Получить инвентарь пользователя"""
        async with self.db.execute(
            'SELECT * FROM inventory WHERE user_id = ?', (user_id,)
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def add_item(self, user_id: int, item_key: str, quantity: int = 1):
        """Добавить предмет в инвентарь"""
        await self.db.execute('''
            INSERT INTO inventory (user_id, item_key, quantity)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, item_key) DO UPDATE SET quantity = quantity + ?
        ''', (user_id, item_key, quantity, quantity))
        await self.db.commit()

    async def remove_item(self, user_id: int, item_key: str, quantity: int = 1):
        """Удалить предмет из инвентаря"""
        item = await self.get_item(user_id, item_key)
        if item and item['quantity'] >= quantity:
            new_qty = item['quantity'] - quantity
            if new_qty <= 0:
                await self.db.execute(
                    'DELETE FROM inventory WHERE user_id = ? AND item_key = ?',
                    (user_id, item_key)
                )
            else:
                await self.db.execute(
                    'UPDATE inventory SET quantity = ? WHERE user_id = ? AND item_key = ?',
                    (new_qty, user_id, item_key)
                )
            await self.db.commit()
            return True
        return False

    async def get_item(self, user_id: int, item_key: str) -> Optional[Dict]:
        """Получить предмет из инвентаря"""
        async with self.db.execute(
            'SELECT * FROM inventory WHERE user_id = ? AND item_key = ?',
            (user_id, item_key)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


# Глобальный экземпляр базы данных
db = Database()


async def init_db():
    """Инициализация базы данных"""
    await db.connect()


async def close_db():
    """Закрытие базы данных"""
    await db.close()
