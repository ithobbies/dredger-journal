# dredger-journal

Веб-приложение для ведения **электронного агрегатного журнала землесосов**  
(ремонты, отклонения, справочник запчастей).

## Cтек
| Слой | Технологии |
|------|------------|
| Backend | **Python 3.12**, Django 4.2 + Django REST Framework, SQLite |
| Auth    | JSON Web Token (Simple JWT) |
| Frontend| **React 18** (TypeScript) + React Router + Axios |
| DevOps  | Docker / docker-compose (позже), GitHub Actions |

## Быстрый старт (backend)

```bash
# 1. Клонируем репозиторий
git clone <repo-url> && cd dredger-journal

# 2. Виртуальное окружение
python -m venv venv
source venv/bin/activate

# 3. Зависимости
pip install -r requirements.txt

# 4. Создаём проект Django
django-admin startproject config .
python manage.py migrate
python manage.py createsuperuser

# 5. Запуск
python manage.py runserver
