#!/bin/bash
# =============================================
# Биржа Рекламы — Push to GitHub
# Запусти из папки "Биржа рекламы" на своём маке:
#   chmod +x push_to_github.sh && ./push_to_github.sh
# =============================================

set -e  # Стоп при любой ошибке

REPO_URL="https://github.com/Gaefa/birja_ADS.git"
BRANCH="main"

echo "🚀 Инициализация репозитория..."

# Убери старый .git если есть
if [ -d ".git" ]; then
  echo "⚠️  Найден существующий .git — удаляю..."
  rm -rf .git
fi

git init -b main
git config user.email "all.in.lexus@gmail.com"
git config user.name "Alexey (BCS)"

echo "📝 Создаю .gitignore..."
cat > .gitignore << 'EOF'
.DS_Store
*.swp
*~
.env
push_to_github.sh
EOF

echo "📁 Добавляю файлы..."
git add ad-exchange/demo.html .gitignore PRD_Биржа_Рекламы_v1.0.docx
[ -f README.md ] && git add README.md

echo "💾 Коммит..."
git commit -m "feat: Биржа Рекламы SPA v1 — полный демо (блогер, эмитент, админ)

- Дашборды для всех ролей (Blogger, Issuer, Admin)
- Система комиссий: глобальная + per-blogger + per-service
- Эскроу, споры, верификация блогеров
- Чат с прикреплением файлов
- Фильтрация форматов по платформам (TG/YT/VK)
- Спецпроект: ручной ввод суммы + расчёт комиссии
- Эксклюзивные услуги с привязкой к блогеру
- Теги авторов с управлением из admin
- Canvas-графики на дашборде (динамический рендер)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "🌐 Добавляю remote..."
git remote add origin "$REPO_URL"

echo "📤 Пушу в $BRANCH..."
git push -u origin "$BRANCH" --force

echo ""
echo "✅ Готово! Репозиторий: https://github.com/Gaefa/birja_ADS"
