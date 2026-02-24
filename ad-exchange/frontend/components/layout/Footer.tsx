export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Биржа Рекламы</h3>
            <p className="text-gray-400">Платформа для подключения эмитентов и блогеров</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Для блогеров</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Как начать</a></li>
              <li><a href="#" className="hover:text-white">Комиссии</a></li>
              <li><a href="#" className="hover:text-white">Поддержка</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Для эмитентов</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Запустить кампанию</a></li>
              <li><a href="#" className="hover:text-white">Ценообразование</a></li>
              <li><a href="#" className="hover:text-white">Поддержка</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Компания</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">О нас</a></li>
              <li><a href="#" className="hover:text-white">Контакты</a></li>
              <li><a href="#" className="hover:text-white">Политика</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex items-center justify-between">
          <p className="text-gray-400">&copy; 2024 Биржа Рекламы. Все права защищены.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white">Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
