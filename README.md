# Dredger Journal

Веб-приложение для ведения **электронного агрегатного журнала землесосов**  
(ремонты, отклонения, справочник запчастей).

## 📋 Содержание
- [Описание](#описание)
- [Технологический стек](#технологический-стек)
- [Требования](#требования)
- [Установка и запуск](#установка-и-запуск)
- [Разработка](#разработка)
- [API Документация](#api-документация)
- [Лицензия](#лицензия)

## 📝 Описание

Dredger Journal - это современное веб-приложение, разработанное для автоматизации и оптимизации процесса ведения агрегатного журнала землесосов. Приложение позволяет эффективно управлять информацией о ремонтах, отслеживать отклонения и вести справочник запчастей.

### Основные возможности:
- Ведение электронного журнала ремонтов
- Отслеживание отклонений в работе оборудования
- Управление справочником запчастей
- Авторизация и разграничение прав доступа
- Экспорт данных в различные форматы

## 🛠 Технологический стек

| Слой | Технологии |
|------|------------|
| Backend | **Python 3.12**, Django 4.2 + Django REST Framework, SQLite |
| Auth    | JSON Web Token (Simple JWT) |
| Frontend| **React 18** (TypeScript) + React Router + Axios |
| DevOps  | Docker / docker-compose (позже), GitHub Actions |

## 📋 Требования

- Python 3.12+
- Node.js 18+ (для frontend)
- SQLite 3
- Git

## 🚀 Установка и запуск

### Backend

```bash
# 1. Клонируем репозиторий
git clone <repo-url> && cd dredger-journal

# 2. Создаём и активируем виртуальное окружение
python -m venv venv
source venv/bin/activate  # для Linux/Mac
# или
.\venv\Scripts\activate  # для Windows

# 3. Устанавливаем зависимости
pip install -r requirements.txt

# 4. Применяем миграции
python manage.py migrate

# 5. Создаём суперпользователя
python manage.py createsuperuser

# 6. Запускаем сервер разработки
python manage.py runserver
```

### Frontend

```bash
# 1. Переходим в директорию frontend
cd dredger-ui

# 2. Устанавливаем зависимости
npm install

# 3. Запускаем сервер разработки
npm run dev
```

## 💻 Разработка

### Структура проекта
```
dredger-journal/
├── apps/               # Django приложения
├── config/            # Конфигурация Django
├── dredger-ui/        # Frontend приложение
├── media/             # Медиа файлы
├── requirements.txt   # Python зависимости
└── manage.py         # Django CLI
```

### Основные команды

```bash
# Создание миграций
python manage.py makemigrations

# Применение миграций
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Запуск тестов
python manage.py test
```

## 📚 API Документация

API документация доступна по адресу `/api/docs/` после запуска сервера.

Основные эндпоинты:
- `/api/auth/` - Аутентификация
- `/api/repairs/` - Управление ремонтами
- `/api/deviations/` - Управление отклонениями
- `/api/parts/` - Справочник запчастей

## 📄 Лицензия

MIT License
