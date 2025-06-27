export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // ✨ Новые функции
        'fix', // 🐛 Исправления ошибок
        'docs', // 📚 Документация
        'style', // 💄 Стили (форматирование, точки с запятой и т.д.)
        'refactor', // 🔧 Рефакторинг кода
        'perf', // ⚡ Улучшения производительности
        'test', // 🧪 Добавление или исправление тестов
        'chore', // 🔨 Изменения в процессе сборки или вспомогательные инструменты
        'ci', // 🤖 Изменения в CI/CD
        'build', // 📦 Изменения в системе сборки
        'revert', // ⏪ Откат изменений
        'security', // 🔒 Исправления безопасности
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};
