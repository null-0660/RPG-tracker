/**
 * Card Component v2.0
 * Компонент карточки задачи
 */

const Card = {
    /**
     * Типы задач и их иконки
     */
    typeIcons: {
        study: '📚',
        sport: '💪',
        creative: '🎨',
        other: '📝'
    },

    /**
     * Названия типов
     */
    typeNames: {
        study: 'Учёба',
        sport: 'Спорт',
        creative: 'Творчество',
        other: 'Другое'
    },

    /**
     * Создать карточку задачи
     */
    create(task, compact = false) {
        const card = document.createElement('div');
        card.className = `task-card type-${task.type}${task.status === 'done' ? ' completed' : ''}`;
        card.dataset.id = task.id;

        const icon = this.typeIcons[task.type] || '📝';
        const difficulty = '⭐'.repeat(task.difficulty);

        if (compact) {
            card.innerHTML = `
                <div class="task-header">
                    <span class="task-title">${this.escapeHtml(task.title)}</span>
                    <span class="task-type-badge">${icon}</span>
                </div>
                <div class="task-meta">
                    <span class="task-meta-item">✨ ${task.xp} XP</span>
                </div>
                ${task.status === 'active' ? `
                    <div class="task-actions">
                        <button class="btn-action btn-complete" data-action="complete">
                            ✅
                        </button>
                        <button class="btn-action btn-edit" data-action="edit">
                            ✏️
                        </button>
                        <button class="btn-action btn-delete" data-action="delete">
                            🗑️
                        </button>
                    </div>
                ` : `
                    <div class="task-actions">
                        <button class="btn-action" disabled style="background: var(--success); color: white; flex: 1;">
                            ✅ Выполнено
                        </button>
                    </div>
                `}
            `;
        } else {
            card.innerHTML = `
                <div class="task-header">
                    <span class="task-title">${this.escapeHtml(task.title)}</span>
                    <span class="task-type-badge">${icon}</span>
                </div>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="task-meta-item">⏱️ ${task.duration} мин</span>
                    <span class="task-meta-item">✨ ${task.xp} XP</span>
                    <span class="task-meta-item">${difficulty}</span>
                </div>
                ${task.subtasks && task.subtasks.length > 0 ? this.renderSubtasks(task.subtasks) : ''}
                ${task.purpose || task.benefit ? `
                    <div class="task-purpose-benefit">
                        ${task.purpose ? `<p class="task-purpose">🎯 ${this.escapeHtml(task.purpose)}</p>` : ''}
                        ${task.benefit ? `<p class="task-benefit">💡 ${this.escapeHtml(task.benefit)}</p>` : ''}
                    </div>
                ` : ''}
                <div class="task-actions">
                    ${task.status === 'active' ? `
                        <button class="btn-action btn-complete" data-action="complete">
                            ✅ Выполнить
                        </button>
                    ` : `
                        <button class="btn-action" disabled style="background: var(--success); color: white;">
                            ✅ Выполнено
                        </button>
                    `}
                    <button class="btn-action btn-edit" data-action="edit">
                        ✏️
                    </button>
                    <button class="btn-action btn-delete" data-action="delete">
                        🗑️
                    </button>
                </div>
            `;
        }

        return card;
    },

    /**
     * Рендер подзадач
     */
    renderSubtasks(subtasks) {
        const completed = subtasks.filter(s => s.completed).length;
        const total = subtasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
            <div class="subtasks-progress">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
                    <span>📋 Подзадачи</span>
                    <span>${completed}/${total}</span>
                </div>
                <div style="height: 6px; background: var(--bg-primary); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 3px; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    },

    /**
     * Создать карточку для боя
     */
    createBattleCard(task, selected = false) {
        const card = document.createElement('div');
        card.className = `battle-task-item${selected ? ' selected' : ''}`;
        card.dataset.id = task.id;
        card.dataset.damage = task.xp;

        const icon = this.typeIcons[task.type];

        card.innerHTML = `
            <div class="battle-task-checkbox">
                ${selected ? '✅' : ''}
            </div>
            <span class="battle-task-title">${this.escapeHtml(task.title)}</span>
            <span class="battle-task-xp">⚔️ ${task.xp}</span>
        `;

        return card;
    },

    /**
     * Получить данные задачи из формы
     */
    getFromForm(formData) {
        const subtasks = [];
        const subtaskInputs = document.querySelectorAll('.subtask-item input');
        subtaskInputs.forEach(input => {
            if (input.value.trim()) {
                subtasks.push({
                    id: Date.now() + Math.random(),
                    title: input.value.trim(),
                    completed: false
                });
            }
        });

        const difficulty = parseInt(formData.difficulty);
        const xp = parseInt(formData.xp) || difficulty * 10;
        const duration = parseInt(formData.duration) || 30;

        return {
            id: formData.id || Date.now().toString(),
            title: formData.title.trim(),
            description: formData.description?.trim() || '',
            purpose: formData.purpose?.trim() || '',
            benefit: formData.benefit?.trim() || '',
            type: formData.type,
            difficulty: difficulty,
            duration: duration,
            xp: xp,
            level: 1,
            status: formData.status || 'active',
            subtasks: subtasks,
            createdAt: formData.createdAt || new Date().toISOString(),
            completedAt: null
        };
    },

    /**
     * Экранирование HTML
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Обработчик действий с карточкой
     */
    handleAction(card, action, callbacks) {
        const taskId = card.dataset.id;

        switch (action) {
            case 'complete':
                if (callbacks.onComplete) {
                    callbacks.onComplete(taskId);
                }
                break;
            case 'edit':
                if (callbacks.onEdit) {
                    callbacks.onEdit(taskId);
                }
                break;
            case 'delete':
                if (callbacks.onDelete) {
                    callbacks.onDelete(taskId);
                }
                break;
        }
    }
};
