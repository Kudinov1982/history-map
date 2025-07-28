// Ждем, пока загрузится API Яндекс.Карт, и только потом выполняем наш код
ymaps.ready(init);

function init() {
    // --- 1. НАСТРОЙКИ И ИНИЦИАЛИЗАЦИЯ ---
    const myMap = new ymaps.Map('map', {
        center: [58, 65],
        zoom: 4,
        controls: ['zoomControl']
    });

    const DATA_URL = 'https://cdn.jsdelivr.net/gh/Kudinov1982/history-map/historical_events_MAX.json';
    
    // Словарь для определения цвета иконок по типу события
    const EVENT_COLORS = {
        'birth': 'islands#redIcon',
        'death': 'islands#blackIcon',
        'battle': 'islands#violetIcon',
        'construction': 'islands#greenIcon',
        'law': 'islands#blueIcon',
        'publication': 'islands#orangeIcon',
        'disaster': 'islands#grayIcon',
        'expedition': 'islands#yellowIcon',
        'default': 'islands#greyIcon' // Цвет по умолчанию, если тип неизвестен
    };

    let allEvents = [];
    let placemarksCollection = new ymaps.GeoObjectCollection(null, {});
    myMap.geoObjects.add(placemarksCollection);

    // Находим элементы на странице
    const yearSlider = document.getElementById('year-slider');
    const startYearDisplay = document.getElementById('start-year');
    const endYearDisplay = document.getElementById('end-year');
    const eventCounter = document.getElementById('event-counter');


    // --- 2. ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ КАРТЫ ---
    function updateMap(startYear, endYear) {
        placemarksCollection.removeAll();

        const eventsInRange = allEvents.filter(event => 
            event.year >= startYear && event.year <= endYear
        );

        eventCounter.textContent = `Найдено событий: ${eventsInRange.length}`;

        eventsInRange.forEach(event => {
            const balloonContent = `
                <div class="custom-balloon">
                    <div class="custom-balloon__title">${event.name}</div>
                    <div class="custom-balloon__type" style="color: ${EVENT_COLORS[event.type] ? EVENT_COLORS[event.type].split('#')[1].slice(0,-4) : 'grey'}">Тип: ${event.type} (${event.year})</div>
                    <div class="custom-balloon__content">
                        ${event.extract}
                        ${event.wiki_url ? `<hr class="custom-balloon__divider"><a href="${event.wiki_url}" target="_blank">Читать в Википедии</a>` : ''}
                    </div>
                </div>
            `;
            const placemark = new ymaps.Placemark(
                [event.lat, event.lon],
                { balloonContent: balloonContent, hintContent: `${event.name} (${event.year})` }, 
                { preset: EVENT_COLORS[event.type] || EVENT_COLORS['default'] }
            );
            placemarksCollection.add(placemark);
        });
    }

    // --- 3. ЗАГРУЗКА ДАННЫХ И ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА ---
    fetch(DATA_URL)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            console.log(`Данные успешно загружены. Всего событий: ${allEvents.length}`);
            
            // Находим минимальный и максимальный год в наших данных
            const minYear = Math.min(...allEvents.map(e => e.year));
            const maxYear = Math.max(...allEvents.map(e => e.year));

            // Инициализируем слайдер-диапазон noUiSlider
            noUiSlider.create(yearSlider, {
                start: [1700, 1725], // Начальный диапазон
                connect: true, // Соединять ползунки линией
                step: 1, // Шаг в 1 год
                range: {
                    'min': minYear,
                    'max': maxYear
                },
                format: { // Форматирование, чтобы убрать десятичные знаки
                    to: value => Math.round(value),
                    from: value => Number(value)
                }
            });

            // Связываем слайдер с функцией обновления карты
            yearSlider.noUiSlider.on('update', (values) => {
                const [startYear, endYear] = values;
                startYearDisplay.textContent = startYear;
                endYearDisplay.textContent = endYear;
                updateMap(startYear, endYear);
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            document.getElementById('map').innerHTML = `<div style="padding: 20px; text-align: center;">Не удалось загрузить данные событий.</div>`;
        });
}