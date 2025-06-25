# 🤝 Руководство по контрибьютингу

Добро пожаловать в проект **Pixel Perfect**! Мы рады, что вы хотите внести свой вклад в развитие расширения. Это руководство поможет вам понять, как эффективно участвовать в проекте.

## 🌟 Способы участия

Существует множество способов помочь проекту:

- **🐛 Сообщения об ошибках** - помогите найти и исправить проблемы
- **✨ Предложения функций** - поделитесь идеями для улучшения
- **💻 Разработка кода** - исправления ошибок и новые функции
- **📚 Документация** - улучшение README, комментариев, wiki
- **🧪 Тестирование** - проверка новых функций и исправлений
- **🎨 Дизайн** - улучшение UI/UX и создание ресурсов
- **🌍 Переводы** - локализация интерфейса
- **💬 Сообщество** - помощь другим пользователям в discussions

## 🚀 Быстрый старт

### 1. Настройка среды разработки

```bash
# Клонируйте репозиторий
git clone https://github.com/cairon666/pixel-perfect-free-extension.git
cd pixel-perfect-free-extension

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev

# Запустите тесты
npm test
```

### 2. Загрузка расширения в браузер

1. Соберите проект: `npm run build:dev`
2. Откройте Chrome/Edge: `chrome://extensions/`
3. Включите "Режим разработчика"
4. Нажмите "Загрузить распакованное расширение"
5. Выберите папку `dist`

### 3. Структура проекта

```
src/
├── background.ts          # Service Worker
├── content.tsx           # Content Script точка входа
├── content/              # Content Script компоненты
│   ├── PixelPerfectApp.tsx
│   ├── components/       # React компоненты
│   └── hooks/           # Пользовательские хуки
├── popup/               # Popup интерфейс
├── store/               # State management (Reatom)
└── lib/                 # Утилиты
```

## 📋 Процесс разработки

### Workflow для исправлений и функций

1. **🍴 Fork репозитория**
2. **🌿 Создайте ветку** от `main`:
   ```bash
   git checkout -b feature/amazing-feature
   # или
   git checkout -b fix/bug-description
   ```
3. **💻 Внесите изменения**
4. **✅ Протестируйте** локально
5. **📝 Commit** с понятным сообщением
6. **🚀 Push** в свой fork
7. **🔄 Создайте Pull Request**

### Naming конвенции

#### Ветки

- `feature/feature-name` - новые функции
- `fix/bug-description` - исправления ошибок
- `docs/update-readme` - обновления документации
- `refactor/component-name` - рефакторинг
- `test/add-unit-tests` - добавление тестов

#### Commits

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Examples:
feat(overlay): add zoom functionality
fix(popup): resolve image loading issue
docs(readme): update installation guide
refactor(hooks): simplify drag logic
test(components): add overlay tests
```

**Types:**

- `feat` - новая функция
- `fix` - исправление ошибки
- `docs` - документация
- `style` - форматирование, стили
- `refactor` - рефакторинг
- `test` - тесты
- `chore` - обслуживание, конфигурация

## 💻 Стандарты кодирования

### TypeScript/React

```typescript
// ✅ Хорошо
interface OverlayProps {
  imageSrc: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const PixelPerfectOverlay: React.FC<OverlayProps> = ({ imageSrc, position, onClose }) => {
  // component logic
};

// ❌ Плохо
const PixelPerfectOverlay = (props: any) => {
  // component logic
};
```

### Стилизация

```typescript
// ✅ Используйте Tailwind CSS
<div className="flex items-center justify-between p-4 bg-white shadow-lg">
  <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
    Action
  </button>
</div>

// ❌ Избегайте inline стилей
<div style={{ display: 'flex', padding: '16px' }}>
  <button style={{ backgroundColor: 'blue' }}>Action</button>
</div>
```

### Именование файлов

- **React компоненты**: `PascalCase.tsx` (например, `PixelPerfectOverlay.tsx`)
- **Hooks**: `camelCase.ts` с префиксом `use` (например, `useDragAndDrop.ts`)
- **Utilities**: `camelCase.ts` (например, `logger.ts`)
- **Types**: `camelCase.ts` (например, `types.ts`)

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# Тесты в watch режиме
npm run test:watch

# Coverage отчет
npm run test:coverage
```

### Написание тестов

```typescript
// src/components/__tests__/PixelPerfectOverlay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelPerfectOverlay } from '../PixelPerfectOverlay';

describe('PixelPerfectOverlay', () => {
  it('should render with image', () => {
    render(
      <PixelPerfectOverlay
        imageSrc="test.jpg"
        position={{ x: 0, y: 0 }}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(
      <PixelPerfectOverlay
        imageSrc="test.jpg"
        position={{ x: 0, y: 0 }}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

### Тестирование расширения

1. **Автоматическое тестирование** - unit и integration тесты
2. **Ручное тестирование** - загрузка в браузер и проверка функций
3. **Cross-browser тестирование** - Chrome, Edge, Brave
4. **Edge cases** - большие изображения, медленные сети

## 📚 Документация

### JSDoc комментарии

```typescript
/**
 * Hook для управления drag and drop функциональностью overlay
 * @param initialPosition - начальная позиция элемента
 * @param onPositionChange - callback для изменения позиции
 * @returns объект с ref элемента и функциями управления
 */
export const useDragAndDrop = (
  initialPosition: { x: number; y: number },
  onPositionChange: (position: { x: number; y: number }) => void
) => {
  // implementation
};
```

### README обновления

При добавлении новой функции обновите:

- Список возможностей
- Раздел использования
- Скриншоты (если нужно)
- API документацию

## 🎨 UI/UX Guidelines

### Дизайн принципы

- **Минимализм** - интерфейс не должен отвлекать от работы
- **Интуитивность** - функции должны быть понятны без объяснений
- **Производительность** - быстрая реакция на действия пользователя
- **Доступность** - поддержка keyboard navigation и screen readers

### Цветовая схема

```css
/* Основные цвета */
--primary: #3b82f6; /* blue-500 */
--primary-hover: #2563eb; /* blue-600 */
--secondary: #6b7280; /* gray-500 */
--success: #10b981; /* emerald-500 */
--warning: #f59e0b; /* amber-500 */
--error: #ef4444; /* red-500 */

/* Фон и текст */
--background: #ffffff;
--surface: #f9fafb; /* gray-50 */
--text-primary: #111827; /* gray-900 */
--text-secondary: #6b7280; /* gray-500 */
```

### Компоненты

- Используйте компоненты из `src/components/ui/`
- Следуйте паттернам существующих компонентов
- Поддерживайте dark mode (если добавляется)

## 🔍 Code Review

### Для авторов PR

- Сделайте self-review перед созданием PR
- Добавьте описание изменений
- Приложите скриншоты для UI изменений
- Убедитесь, что все checks прошли

### Для ревьюеров

- Проверьте логику и архитектуру
- Убедитесь в наличии тестов
- Проверьте производительность
- Оцените влияние на UX
- Будьте конструктивны в комментариях

### Критерии приемки

- ✅ Код читаем и понятен
- ✅ Функция работает как ожидается
- ✅ Тесты покрывают новую логику
- ✅ Нет регрессий
- ✅ Производительность не пострадала
- ✅ UI изменения интуитивны

## 🐛 Сообщения об ошибках

### Хороший bug report содержит

1. **Четкое описание** проблемы
2. **Шаги воспроизведения**
3. **Ожидаемое поведение**
4. **Фактическое поведение**
5. **Системная информация** (браузер, ОС, версия расширения)
6. **Скриншоты** или видео
7. **Логи консоли** (если есть ошибки)

### Используйте шаблон issue

Всегда используйте [шаблон для bug reports](.github/ISSUE_TEMPLATE/bug_report.yml) - это поможет собрать всю необходимую информацию.

## ✨ Предложения функций

### Хороший feature request включает

1. **Проблему**, которую решает функция
2. **Предлагаемое решение**
3. **Сценарии использования**
4. **Мокапы** или эскизы (если применимо)
5. **Альтернативные решения**

### Процесс добавления функций

1. **Создайте issue** с описанием
2. **Обсуждение** с мейнтейнерами
3. **Планирование** архитектуры
4. **Реализация** в feature branch
5. **Code review** и тестирование
6. **Merge** в main

## 🔒 Безопасность

### Сообщения о уязвимостях

Если вы нашли уязвимость безопасности:

1. **НЕ создавайте публичный issue**
2. Отправьте email на: security@pixelperfect-extension.com
3. Опишите проблему подробно
4. Предложите способ исправления (если знаете)

### Рекомендации по безопасности

- Не логируйте чувствительные данные
- Валидируйте все пользовательские вводы
- Используйте Content Security Policy
- Минимизируйте разрешения расширения

## 📅 Релизный процесс

### Версионирование

Проект использует [Semantic Versioning](https://semver.org/):

- `MAJOR` - Breaking changes
- `MINOR` - Новые функции (обратно совместимые)
- `PATCH` - Исправления ошибок

### Релиз процедура

1. Обновление версии в `package.json` и `manifest.json`
2. Создание git tag `v1.2.3`
3. Автоматическая сборка и публикация через GitHub Actions
4. Создание release notes

## 💬 Сообщество

### Где получить помощь

- **GitHub Issues** - для bug reports и feature requests
- **GitHub Discussions** - для общих вопросов и обсуждений
- **Email** - support@pixelperfect-extension.com

### Кодекс поведения

- Будьте уважительны к другим участникам
- Конструктивно критикуйте код, а не людей
- Помогайте новичкам в проекте
- Следуйте принципам open source сообщества

## 🏆 Признание контрибьюторов

Мы ценим каждый вклад в проект:

- Все контрибьюторы указываются в README
- Значительные вклады отмечаются в release notes
- Активные участники могут получить права мейнтейнера

---

**Спасибо за ваш интерес к проекту Pixel Perfect! 🎉**

Если у вас есть вопросы по этому руководству, создайте issue или обратитесь к мейнтейнерам.
