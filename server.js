const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs'); 

const categories = {
    business: 'business',
    economic: 'economic',
    finances: 'finance',
    politics: 'politics',
    auto: 'auto'
};

app.get('/:count/news/for/:category', async (req, res) => {
    const count = parseInt(req.params.count);
    const category = req.params.category;

    if (!count || count <= 0 || count > 50) {
        return res.status(400).send('Ошибка: укажите число от 1 до 50');
    }

    if (!categories[category]) {
        return res.status(400).send('Ошибка: категория не поддерживается. Доступно: business, economic, finances, politics, auto');
    }

    try {
        const rssUrl = `https://www.vedomosti.ru/rss/rubric/${categories[category]}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        const response = await axios.get(apiUrl);
        const items = response.data.items.slice(0, count);

        const russianNames = {
            business: 'Бизнес',
            economic: 'Экономика',
            finances: 'Финансы',
            politics: 'Политика',
            auto: 'Авто'
        };

        const title = `${count} последних новостей в категории ${russianNames[category]}`;

        res.render('news', {
            title: title,
            news: items
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Не удалось загрузить новости. Попробуйте позже.');
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h2>Парсер новостей Ведомости</h2>
        <p>Пример: <a href="/10/news/for/politics">/10/news/for/politics</a></p>
        <p>Доступные категории: business, economic, finances, politics, auto</p>
    `);
});

app.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
    console.log('Пример: http://localhost:3000/10/news/for/auto');
});