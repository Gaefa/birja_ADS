# Биржа Рекламы — Ad Exchange Platform

Платформа для размещения рекламы у блогеров в финансовом и крипто-сегменте.

## Стек
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **БД:** PostgreSQL 16 (Docker)

## Быстрый старт

### 1. Поднять базу данных
```bash
docker-compose up -d
```
PostgreSQL будет доступен на `localhost:5432`.

### 2. Настроить и запустить бэкенд
```bash
cd backend

# Скопировать env (уже настроен для локалки)
cp .env.example .env

# Накатить миграции и создать схему БД
npx prisma migrate dev --name init

# Заполнить тестовыми данными
npx prisma db seed

# Запустить бэкенд
npm run start:dev
```
API будет на `http://localhost:3001`
Swagger: `http://localhost:3001/api/docs`

### 3. Запустить фронтенд
```bash
cd frontend
npm run dev
```
Сайт: `http://localhost:3000`

---

## Тестовые аккаунты (после seed)

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@adexchange.ru | admin123 |
| Эмитент (верифицирован) | issuer1@test.ru | pass123 |
| Эмитент (ожидает верификации) | issuer2@test.ru | pass123 |
| Блогер 1 | blogger1@test.ru | pass123 |
| Блогер 2 | blogger2@test.ru | pass123 |
| Блогер 3 | blogger3@test.ru | pass123 |

---

## API Endpoints

### Auth
- `POST /auth/register` — регистрация
- `POST /auth/login` — вход
- `POST /auth/refresh` — обновить токен
- `GET /auth/me` — текущий пользователь

### Блогеры (требует роль BLOGGER)
- `GET /bloggers/me` — свой профиль
- `PUT /bloggers/me` — обновить профиль
- `POST /bloggers/me/socials` — добавить соцсеть
- `POST /bloggers/me/prices` — добавить позицию в прайс
- `POST /bloggers/me/portfolio` — добавить в портфолио

### Каталог блогеров (только для верифицированных ISSUER)
- `GET /bloggers` — список блогеров с прайсами
- `GET /bloggers/:id` — профиль конкретного блогера

### Эмитенты (требует роль ISSUER)
- `GET /issuers/me` — свой профиль
- `PUT /issuers/me` — обновить профиль

### Кампании
- `GET /campaigns` — список (блогеры видят только публичные)
- `POST /campaigns` — создать (ISSUER)
- `POST /campaigns/:id/apply` — откликнуться (BLOGGER)
- `PUT /campaigns/:id/applications/:appId` — принять/отклонить (ISSUER)

### Сделки
- `POST /deals` — создать прямую сделку (ISSUER)
- `GET /deals` — мои сделки
- `POST /deals/:id/fund` — оплатить эскроу (ISSUER)
- `POST /deals/:id/submit` — подтвердить выход контента (BLOGGER)
- `POST /deals/:id/confirm` — подтвердить и оплатить (ISSUER)
- `POST /deals/:id/dispute` — открыть спор

### Админ (требует роль ADMIN)
- `GET /admin/issuers/pending` — очередь верификации
- `POST /admin/issuers/:id/verify` — верифицировать
- `GET /admin/disputes` — споры
- `PUT /admin/disputes/:id/resolve` — разрешить спор
- `GET /admin/stats` — статистика платформы

---

## Структура проекта

```
ad-exchange/
├── docker-compose.yml          # PostgreSQL + Redis
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Схема БД (13 моделей)
│   │   └── seed.ts             # Тестовые данные
│   └── src/
│       ├── auth/               # JWT аутентификация
│       ├── bloggers/           # Профили блогеров + прайс + соцсети
│       ├── issuers/            # Профили эмитентов + подписка
│       ├── campaigns/          # Кампании + отклики
│       ├── deals/              # Сделки + эскроу
│       ├── admin/              # Верификация + споры
│       └── common/             # Guards, decorators
└── frontend/
    ├── app/
    │   ├── page.tsx            # Лендинг
    │   ├── (auth)/             # Логин + регистрация
    │   ├── (blogger)/          # Кабинет блогера
    │   ├── (issuer)/           # Кабинет эмитента
    │   └── (admin)/            # Админ-панель
    ├── components/
    └── lib/
        ├── api.ts              # Axios instance с JWT
        └── auth.ts             # Утилиты авторизации
```
